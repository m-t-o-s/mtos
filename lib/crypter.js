'use strict'

var forge = (window.forge || require('node-forge'))
var q = require('q')

var rsa = forge.pki.rsa

var crypter = {}

crypter.generateKeyPair = function (options) {
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

module.exports = crypter
