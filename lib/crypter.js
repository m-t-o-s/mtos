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
    deferred.resolve({
      publicKey: keypair.publicKey,
      privateKey: keypair.privateKey,
      publicKeyFingerprint: window.forge.ssh.getPublicKeyFingerprint(keypair.publicKey, {encoding: 'hex', delimiter: ':'}),
      publicKeyString: window.forge.ssh.publicKeyToOpenSSH(keypair.publicKey),
      privateKeyString: window.forge.ssh.privateKeyToOpenSSH(keypair.privateKey)
    })
    return deferred.promise
  })
}

module.exports = crypter
