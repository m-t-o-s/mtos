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
    var md = forge.md.sha256.create()
    md.update(parsedContent.message, 'utf-8')
    var verified = (publicKey.verify(md.digest().bytes(), signature))
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
    var envelope = forge.pkcs7.createEnvelopedData()
    var certificate = forge.pki.createCertificate()
    certificate.publicKey = publicKey
    envelope.addRecipient(certificate)
    envelope.content = forge.util.createBuffer(JSON.stringify(content))
    envelope.encrypt()
    var pem = forge.pkcs7.messageToPem(envelope)
    resolve(pem)
  })
  return promise
}

crypter.decryptContent = function (message, privateKey) {
  var promise = new Promise(function (resolve, reject) {
    var envelope = forge.pkcs7.messageFromPem(message)
    envelope.decrypt(envelope.recipients[0], privateKey)
    resolve(JSON.parse(envelope.content.data))
  })
  return promise
}

var crypto = require('crypto')

crypter.generateSharedPrivate = function (b64Prime) {
  var dh
  if (b64Prime) {
    dh = crypto.createDiffieHellman(b64Prime, 'base64')
  } else {
    dh = crypto.createDiffieHellman(1024)
  }
  var promise = new Promise(function (resolve, reject) {
    var publicKey = dh.generateKeys('base64')
    var privateKey = dh.getPrivateKey('base64')
    var prime = dh.getPrime('base64')
    resolve({
      privateKey: privateKey,
      publicKey: publicKey,
      prime: prime
    })
  })
  return promise
}

crypter.deriveSharedSecret = function (privateKnowledge, publicKey) {
  var promise = new Promise(function (resolve, reject) {
    var dh = crypto.createDiffieHellman(privateKnowledge.prime, 'base64')
    dh.setPrivateKey(privateKnowledge.privateKey, 'base64')
    dh.setPublicKey(privateKnowledge.publicKey, 'base64')
    var sharedKey = dh.computeSecret(publicKey, 'base64', 'base64')
    resolve(sharedKey)
  })
  return promise
}

module.exports = crypter
