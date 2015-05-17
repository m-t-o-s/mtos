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
  console.log('crypter loading from key strings', options)
  var usableKeys = {
    privateKey: forge.pki.privateKeyFromPem(keyStrings.privateKeyString),
    publicKey: forge.pki.publicKeyFromPem(keyStrings.publicKeyString)
  }
  return usableKeys
}

module.exports = crypter
