'use strict'

var mtos = require('../')
var tape = require('blue-tape')
var q = require('q')

var serverKeyOne = mtos.newServerKey()
var serverKeyTwo = mtos.newServerKey()

function ensureKey (key, t) {
  var fingerpringStringLength = key.publicKeyFingerprint.length
  t.ok(key.publicKey, 'has public key')
  t.ok(key.publicKey.encrypt, 'can use public key for encryption')
  t.ok(key.publicKey.verify, 'can use public key for verification')
  t.ok(key.privateKey, 'has private key')
  t.ok(key.privateKey.decrypt, 'can use private key for decryption')
  t.ok(key.privateKey.sign, 'can use private key for signing')
  t.ok(key.publicKeyString, 'has public key string')
  t.ok(key.privateKeyString, 'has private key string')
  t.equal(59, fingerpringStringLength, 'has a public key fingerprint 59 characters long')
}

tape('generate a server key', function (t) {
  return serverKeyOne
  .then(function (key) {
    ensureKey(key, t)
  })
})

tape('generate another server key', function (t) {
  return serverKeyTwo
  .then(function (key) {
    ensureKey(key, t)
  })
})

tape('server keys are not equal', function (t) {
  return q.all([serverKeyOne, serverKeyTwo])
  .then(function (keys) {
    t.notEqual(keys[0].publicKeyFingerprint, keys[1].publicKeyFingerprint, 'the keys have different fingerprints')
  })
})
