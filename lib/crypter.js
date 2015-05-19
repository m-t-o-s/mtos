'use strict'

var forge = (window.forge || require('node-forge'))
var q = require('q')

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
      publicKeyFingerprint: window.forge.pki.getPublicKeyFingerprint(keypair.publicKey, {encoding: 'hex', delimiter: ':'}),
      publicKeyString: window.forge.pki.publicKeyToPem(keypair.publicKey),
      privateKeyString: window.forge.pki.privateKeyToPem(keypair.privateKey)
    }
    if (options && options.passphrase) {
      console.log('encrypting key')
      returnKey.privateKeyString = window.forge.pki.encryptRsaPrivateKey(keypair.privateKey, options.passphrase)
    }
    deferred.resolve(returnKey)
    return deferred.promise
  })
}

crypter.loadKeyFromStrings = function (keyStrings, options) {
  console.log('crypter loading from key strings', keyStrings, options)
  var publicKey = forge.pki.publicKeyFromPem(keyStrings.publicKeyString)
  var privateKey
  if (options && options.passphrase) {
    privateKey = forge.pki.decryptRsaPrivateKey(keyStrings.privateKeyString, options.passphrase)
  } else {
    privateKey = forge.pki.privateKeyFromPem(keyStrings.privateKeyString)
  }
  var usableKeys = {
    privateKey: privateKey,
    publicKey: publicKey
  }
  return usableKeys
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
  console.log('decrypting', content, privateKey)
  var deferred = q.defer()
  var envelope = forge.pkcs7.messageFromPem(content)
  envelope.decrypt(envelope.recipients[0], privateKey)
  console.log('decrypted', envelope.content.data)
  deferred.resolve(envelope.content.data)
  return deferred.promise
}

module.exports = crypter
