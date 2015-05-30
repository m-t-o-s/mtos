'use strict'

// FIXME: is this a bad idea?
var forge = global.forge = (global.forge || require('node-forge'))

var rsa = forge.pki.rsa

var crypter = {}

crypter.forgeKeyPair = function (options) {
  if (!options) {
    options = {
      bits: 2048,
      workers: -1
    }
  }
  var promise = new Promise(function (resolve, reject) {
    rsa.generateKeyPair(options, function (error, keypair) {
      if (error) {
        throw new Error(error)
      }
      resolve(keypair)
    })
  })
  return promise
}

crypter.generateKeyPair = function (options) {
  return crypter.forgeKeyPair(options)
  .then(function (keypair) {
    var promise = new Promise(function (resolve, reject) {
      var returnKey = {
        publicKey: keypair.publicKey,
        privateKey: keypair.privateKey,
        publicKeyFingerprint: global.forge.pki.getPublicKeyFingerprint(keypair.publicKey, {encoding: 'hex', delimiter: ':'}),
        publicKeyString: global.forge.pki.publicKeyToPem(keypair.publicKey),
        privateKeyString: global.forge.pki.privateKeyToPem(keypair.privateKey)
      }
      if (options && options.passphrase) {
        returnKey.privateKeyString = global.forge.pki.encryptRsaPrivateKey(keypair.privateKey, options.passphrase)
      }
      resolve(returnKey)
    })
    return promise
  })
}

crypter.loadKeyFromStrings = function (keyStrings, options) {
  var promise = new Promise(function (resolve, reject) {
    var publicKey = forge.pki.publicKeyFromPem(keyStrings.publicKeyString)
    var privateKey
    if (options && options.passphrase) {
      privateKey = forge.pki.decryptRsaPrivateKey(keyStrings.privateKeyString, options.passphrase)
    } else {
      privateKey = forge.pki.privateKeyFromPem(keyStrings.privateKeyString)
    }
    var usableKeys = {
      publicKeyString: keyStrings.publicKeyString,
      privateKeyString: keyStrings.privateKeyString,
      publicKeyFingerprint: keyStrings.publicKeyFingerprint,
      privateKey: privateKey,
      publicKey: publicKey
    }
    resolve(usableKeys)
  })
  return promise
}

crypter.publicKeyFromString = function (string) {
  var promise = new Promise(function (resolve, reject) {
    resolve(forge.pki.publicKeyFromPem(string))
  })
  return promise
}

crypter.signContent = function (content, privateKey) {
  var promise = new Promise(function (resolve, reject) {
    var digest = forge.md.sha256.create()
    digest.update(content, 'utf-8')
    resolve(JSON.stringify({
       message: content,
       signature: forge.util.encode64(privateKey.sign(digest))
     }))
  })
  return promise
}

crypter.verifyContent = function (content, publicKey) {
  var promise = new Promise(function (resolve, reject) {
    var parsedContent = JSON.parse(content)
    var signature = forge.util.decode64(parsedContent.signature)
    console.log('verifying', parsedContent)
    var md = forge.md.sha256.create()
    md.update(parsedContent.message, 'utf-8')
    var verified = (publicKey.verify(md.digest().bytes(), signature))
    console.log('verified', verified, parsedContent.message)
    if (verified === true) {
      resolve(parsedContent.message)
    } else {
      reject('message is not signed')
    }
  })
  return promise
}

crypter.encryptContent = function (content, publicKey) {
  var promise = new Promise(function (resolve, reject) {
    console.log('encrypting', content)
    var envelope = forge.pkcs7.createEnvelopedData()
    var certificate = forge.pki.createCertificate()
    certificate.publicKey = publicKey
    envelope.addRecipient(certificate)
    envelope.content = forge.util.createBuffer(JSON.stringify(content))
    envelope.encrypt()
    var pem = forge.pkcs7.messageToPem(envelope)
    console.log('encrypted', pem)
    resolve(pem)
  })
  return promise
}

crypter.decryptContent = function (message, privateKey) {
  var promise = new Promise(function (resolve, reject) {
    console.log('decrypting', message)
    var envelope = forge.pkcs7.messageFromPem(message)
    envelope.decrypt(envelope.recipients[0], privateKey)
    console.log('decrypted', envelope.content.data)
    resolve(JSON.parse(envelope.content.data))
  })
  return promise
}

var crypto = require('crypto')
var eccrypto = require('eccrypto')

/*
q.all([
  crypter.generateSharedPrivate(),
  crypter.generateSharedPrivate()
])
.then(function (values) {
  var alice = values[0]
  console.log('private', values)
  var bob = values[1]
  return q.all([
    crypter.deriveSharedSecret(alice.privateKey, bob.publicKey),
    crypter.deriveSharedSecret(bob.privateKey, alice.publicKey)
  ])
})
.then(function (values) {
  console.log('shared', values)
})
*/

function b64Encode (array) {
  return global.btoa(String.fromCharCode.apply(null, array))
}

function b64Decode (string) {
  return global.atob(string).split('')
  .map(function (c) {
    return c.charCodeAt(0)
  })
}

crypter.generateSharedPrivate = function () {
  var promise = new Promise(function (resolve, reject) {
    var privateKeyArray = crypto.randomBytes(32)
    var privateKey = b64Encode(privateKeyArray)
    var publicKey = b64Encode(eccrypto.getPublic(privateKeyArray))
    console.log(privateKey, publicKey)
    resolve({
      privateKey: privateKey,
      publicKey: publicKey
    })
  })
  return promise
}

crypter.deriveSharedSecret = function (privateKeyString, publicKeyString) {
  var promise = new Promise(function (resolve, reject) {
    console.log('deriving', privateKeyString, publicKeyString)
    var privateKey = b64Decode(privateKeyString)
    var publicKey = b64Decode(publicKeyString)
    console.log('deriving', privateKey, publicKey)
    eccrypto.derive(privateKey, publicKey)
    .then(function (sharedKey) {
      resolve(b64Encode(sharedKey))
    })
  })
  return promise
}

module.exports = crypter
