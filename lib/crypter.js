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
  // deferred.resolve({
  //   content: content,
  //   signature: forge.util.encode64(privateKey.sign(digest))
  // })
  deferred.resolve(content)
  return deferred.promise
}

crypter.encryptContent = function (content, publicKey) {
  console.log('encrypting', content)
  var deferred = q.defer()
  var encryptedContent = publicKey.encrypt(content)
  var b64 = forge.util.encode64(encryptedContent)
  console.log('encrypted', b64)
  deferred.resolve(b64)
  return deferred.promise
}

crypter.decryptContent = function (content, privateKey) {
  window.content = content
  console.log('decrypting', content, privateKey)
  var deferred = q.defer()
  var decoded = forge.util.decode64(content)
  window.decoded = decoded
  console.log('decoded', typeof decoded, decoded)
  // var bytes = forge.util.hexToBytes(decoded)
  // console.log('bytes', bytes)
  // var buffer = forge.util.createBuffer(decoded, 'utf-8')
  var decryptedContent = privateKey.decrypt(decoded)
  // var b64 = forge.util.encode64(decryptedContent)
  console.log('decrypted', decryptedContent)
  deferred.resolve(decryptedContent)
  return deferred.promise
}

module.exports = crypter
