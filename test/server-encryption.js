'use strict'

var MTOS = require('../')
var mtos = new MTOS()
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

tape('server keys loaded from strings are valid', function (t) {
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
  })
})

var generateDH = mtos.generateSharedPrivate()
.then(function (dhOne) {
  var promise = new Promise(function (resolve, reject) {
    mtos.generateSharedPrivate(dhOne.prime)
    .then(function (dhTwo) {
      resolve({
        dhOne: dhOne,
        dhTwo: dhTwo
      })
    })
  })
  return promise
})

generateDH
.then(function () {
  console.log('WHOOP')
})

tape('can create DH private and public keys and a prime', function (t) {
  return generateDH
  .then(function (dhKeys) {
    t.ok(dhKeys.dhOne.privateKey, 'key one has a private key')
    t.ok(dhKeys.dhOne.publicKey, 'key one has a public key')
    t.ok(dhKeys.dhOne.prime, 'key one has a prime')
    t.ok(dhKeys.dhTwo.privateKey, 'key two has a private key')
    t.ok(dhKeys.dhTwo.publicKey, 'key two has a public key')
    t.ok(dhKeys.dhTwo.prime, 'key two has a prime')
    t.notEqual(dhKeys.dhOne.publicKey, dhKeys.dhTwo.publicKey, 'key one and key two have different public keys')
    t.equal(dhKeys.dhOne.prime, dhKeys.dhTwo.prime, 'key one and key two have the same prime')
    t.end()
  })
})

tape('can derive shared secret', function (t) {
  return generateDH
  .then(function (dhKeys) {
    return Promise.all([
      mtos.deriveSharedSecret(dhKeys.dhOne, dhKeys.dhTwo.publicKey),
      mtos.deriveSharedSecret(dhKeys.dhTwo, dhKeys.dhOne.publicKey)
    ])
    .then(function (secrets) {
      console.log('secrets', secrets)
      t.equal(secrets[0], secrets[1], 'shared secrets are equal')
      t.end()
      process.exit()
    })
  })
})
