'use strict'

var tape = require('tape')

var servers = require('../integration-servers')

function waitForServers () {
  return servers
}

var defaultOptions
var tracker
// var hub
waitForServers().then(function (servers) {
  console.log('got defaults')
  defaultOptions = servers.defaultOptions
  tracker = servers.tracker
  // hub = servers.hub
})

waitForServers().then(function () {
  var MTOS = require('../../')
  var mtosAlice = new MTOS(defaultOptions)
  var mtosBob = new MTOS(defaultOptions)
  var mtosEve = new MTOS(defaultOptions)

  var testingKeys = require('../testing-keys.json')

  var userKeyAlice = mtosAlice.unlockIdentity(testingKeys.userKeyAlice, 'alice')
  var userKeyBob = mtosBob.unlockIdentity(testingKeys.userKeyBob, 'bob')
  var userKeyEve = mtosEve.unlockIdentity(testingKeys.userKeyEve, 'eve')

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
    .catch(function (error) {
      console.log('Error:', error)
    })
    return promise
  }

  tape('user keys loaded from strings are valid', function (t) {
    return Promise.all([userKeyAlice, userKeyBob, userKeyEve])
    .then(function (keys) {
      var promises = []
      for (var i = 0; i < keys.length; i++) {
        promises.push(ensureKey(keys[i], t))
      }
      Promise.all(promises)
      .then(function () {
        t.end()
      })
    })
  })

  tape('can load a public key from a string', function (t) {
    return mtosAlice.publicKeyFromString(testingKeys.serverKeyOne.publicKeyString)
    .then(function (key) {
      t.ok(key, 'has public key')
      t.ok(key.encrypt, 'can use public key for encryption')
      t.ok(key.verify, 'can use public key for verification')
      t.end()
    })
  })

  tape('user keys are not equal', function (t) {
    return Promise.all([userKeyAlice, userKeyBob, userKeyEve])
    .then(function (keys) {
      t.notEqual(keys[0].publicKeyFingerprint, keys[1].publicKeyFingerprint, 'alice and bob have different fingerprints')
      t.notEqual(keys[1].publicKeyFingerprint, keys[2].publicKeyFingerprint, 'bob and eve have different fingerprints')
      t.notEqual(keys[0].publicKeyFingerprint, keys[2].publicKeyFingerprint, 'alice and eve have different fingerprints')
      t.end()
    })
  })

  tape('can sign with a private key and verify from a public key', function (t) {
    var keypairs
    var content = {
      secretMessage: 'this content is verifiable'
    }
    return Promise.all([userKeyAlice, userKeyBob])
    .then(function (keys) {
      keypairs = keys
      return mtosAlice.signContent(content, keypairs[1].privateKey)
    })
    .then(function (encryptedMessage) {
      return mtosBob.verifyContent(encryptedMessage, keypairs[1].publicKey)
    })
    .then(function (verifiedContent) {
      t.deepEqual(verifiedContent, JSON.stringify(content), 'verified verifiable message')
      t.end()
    })
  })

  tape('can encrypt from a public key and decrypt from a private key', function (t) {
    var keypairs
    var content = {
      secretMessage: 'there are secrets here'
    }
    return Promise.all([userKeyAlice, userKeyBob])
    .then(function (keys) {
      keypairs = keys
      return mtosAlice.encryptContent(content, keypairs[0].publicKey)
    })
    .then(function (encryptedMessage) {
      return mtosBob.decryptContent(encryptedMessage, keypairs[0].privateKey)
    })
    .then(function (decryptedContent) {
      t.deepEqual(decryptedContent, content, 'decrypted secret message')
      t.end()
    })
  })

  var generateDH

  tape('can run DH generation', function (t) {
    generateDH = mtosAlice.generateSharedPrivate()
    .then(function (dhOne) {
      console.log('dhOne', dhOne)
      return new Promise(function (resolve, reject) {
        mtosBob.generateSharedPrivate(dhOne.prime)
        .then(function (dhTwo) {
          resolve({
            dhOne: dhOne,
            dhTwo: dhTwo
          })
          t.end()
        })
      })
    })

    generateDH
    .then(function () {
      console.log('WHOOP')
    })
  })

  tape('can create DH private and public keys and a prime', function (t) {
    console.log('generating dh')
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
        mtosAlice.deriveSharedSecret(dhKeys.dhOne, dhKeys.dhTwo.publicKey),
        mtosBob.deriveSharedSecret(dhKeys.dhTwo, dhKeys.dhOne.publicKey)
      ])
      .then(function (secrets) {
        console.log('secrets', secrets)
        t.equal(secrets[0], secrets[1], 'shared secrets are equal')
        t.end()
      })
    })
  })

  tape('can shut down tracker', function (t) {
    tracker.close()
    t.ok(tracker.destroyed, 'tracker shut down')
    t.end()
    process.exit()
  })
})
