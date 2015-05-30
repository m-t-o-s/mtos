'use strict'

var q = require('q')

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
  var deferred = q.defer()
  rsa.generateKeyPair(options, function (error, keypair) {
    if (error) {
      throw new Error(error)
    }
    deferred.resolve(keypair)
  })
  return deferred.promise
}

crypter.generateKeyPair = function (options) {
  return crypter.forgeKeyPair(options)
  .then(function (keypair) {
    var deferred = q.defer()
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
    deferred.resolve(returnKey)
    return deferred.promise
  })
}

crypter.loadKeyFromStrings = function (keyStrings, options) {
  var deferred = q.defer()
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
  deferred.resolve(usableKeys)
  return deferred.promise
}

crypter.publicKeyFromString = function (string) {
  return forge.pki.publicKeyFromPem(string)
}

crypter.signContent = function (content, privateKey) {
  var deferred = q.defer()
  var digest = forge.md.sha256.create()
  digest.update(content, 'utf-8')
  deferred.resolve(JSON.stringify({
     message: content,
     signature: forge.util.encode64(privateKey.sign(digest))
   }))
  return deferred.promise
}

crypter.verifyContent = function (content, publicKey) {
  var deferred = q.defer()
  var parsedContent = JSON.parse(content)
  var signature = forge.util.decode64(parsedContent.signature)
  console.log('verifying', parsedContent)
  var md = forge.md.sha256.create()
  md.update(parsedContent.message, 'utf-8')
  var verified = (publicKey.verify(md.digest().bytes(), signature))
  console.log('verified', verified, parsedContent.message)
  if (verified === true) {
    deferred.resolve(parsedContent.message)
  } else {
    deferred.reject('message is not signed')
  }
  return deferred.promise
}

crypter.encryptContent = function (content, publicKey) {
  console.log('encrypting', content)
  var deferred = q.defer()
  var envelope = forge.pkcs7.createEnvelopedData()
  var certificate = forge.pki.createCertificate()
  certificate.publicKey = publicKey
  envelope.addRecipient(certificate)
  envelope.content = forge.util.createBuffer(content)
  envelope.encrypt()
  var pem = forge.pkcs7.messageToPem(envelope)
  console.log('encrypted', pem)
  deferred.resolve(pem)
  return deferred.promise
}

crypter.decryptContent = function (content, privateKey) {
  console.log('decrypting', content)
  var deferred = q.defer()
  var envelope = forge.pkcs7.messageFromPem(content)
  envelope.decrypt(envelope.recipients[0], privateKey)
  console.log('decrypted', envelope.content.data)
  deferred.resolve(envelope.content.data)
  return deferred.promise
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
  var deferred = q.defer()
  var privateKeyArray = crypto.randomBytes(32)
  var privateKey = b64Encode(privateKeyArray)
  var publicKey = b64Encode(eccrypto.getPublic(privateKeyArray))
  console.log(privateKey, publicKey)
  deferred.resolve({
    privateKey: privateKey,
    publicKey: publicKey
  })
  return deferred.promise
}

crypter.deriveSharedSecret = function (privateKeyString, publicKeyString) {
  console.log('deriving', privateKeyString, publicKeyString)
  var deferred = q.defer()
  var privateKey = b64Decode(privateKeyString)
  var publicKey = b64Decode(publicKeyString)
  console.log('deriving', privateKey, publicKey)
  eccrypto.derive(privateKey, publicKey)
  .then(function (sharedKey) {
    deferred.resolve(b64Encode(sharedKey))
  })
  return deferred.promise
}

module.exports = crypter
