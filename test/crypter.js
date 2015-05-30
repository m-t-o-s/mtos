'use strict'

var mtos = require('../')
var tape = require('tape')

var testingKeys = require('./testing-keys.json')

var serverKeyOne = mtos.loadKeyFromStrings(testingKeys.serverKeyOne)
var serverKeyTwo = mtos.loadKeyFromStrings(testingKeys.serverKeyTwo)

function ensureKey (key, t) {
  var promise = new Promise(function (resolve, reject) {
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
    resolve(key)
  })
  return promise
}

tape('keys loaded from strings are valid', function (t) {
  return Promise.all([serverKeyOne, serverKeyTwo])
  .then(function (keys) {
    for (var i = 0; i < keys.length; i++) {
      ensureKey(keys[i], t)
    }
    t.end()
  })
})

tape('can load a public key from a string', function (t) {
  return mtos.publicKeyFromString(testingKeys.serverKeyOne.publicKeyString)
  .then(function (key) {
    console.log(key)
    t.ok(key, 'has public key')
    t.ok(key.encrypt, 'can use public key for encryption')
    t.ok(key.verify, 'can use public key for verification')
    t.end()
  })
})

tape('server keys are not equal', function (t) {
  return Promise.all([serverKeyOne, serverKeyTwo])
  .then(function (keys) {
    t.notEqual(keys[0].publicKeyFingerprint, keys[1].publicKeyFingerprint, 'the keys have different fingerprints')
    t.end()
  })
})

tape('can sign with a private key and verify from a public key', function (t) {
  var keypairs
  var content = {
    secretMessage: 'this content is verifiable'
  }
  return Promise.all([serverKeyOne, serverKeyTwo])
  .then(function (keys) {
    keypairs = keys
    return mtos.signContent(content, keypairs[1].privateKey)
  })
  .then(function (encryptedMessage) {
    return mtos.verifyContent(encryptedMessage, keypairs[1].publicKey)
  })
  .then(function (verifiedContent) {
    t.deepEqual(verifiedContent, content, 'verified verifiable message')
    t.end()
  })
})

tape('can encrypt from a public key and decrypt from a private key', function (t) {
  var keypairs
  var content = {
    secretMessage: 'there are secrets here'
  }
  return Promise.all([serverKeyOne, serverKeyTwo])
  .then(function (keys) {
    keypairs = keys
    return mtos.encryptContent(content, keypairs[0].publicKey)
  })
  .then(function (encryptedMessage) {
    return mtos.decryptContent(encryptedMessage, keypairs[0].privateKey)
  })
  .then(function (decryptedContent) {
    t.deepEqual(decryptedContent, content, 'decrypted secret message')
    t.end()
    process.exit()
  })
})
