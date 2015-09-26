'use strict'

var servers = require('../integration-servers')

function waitForServers () {
  return servers
}

var defaultOptions
var tracker
var hub
waitForServers().then(function (servers) {
  console.log('got defaults')
  defaultOptions = servers.defaultOptions
  tracker = servers.tracker
  hub = servers.hub
})

var tape = require('tape')

waitForServers().then(function () {
  var MTOS = require('../../')
  var mtos = new MTOS(defaultOptions)
  var mtosAlice = new MTOS(defaultOptions)
  var mtosBob = new MTOS(defaultOptions)
  var mtosEve = new MTOS(defaultOptions)

  var testingKeys = require('../testing-keys.json')
  console.log(hub)

  var userKeyAlice = mtosAlice.loadKeyFromStrings(testingKeys.userKeyAlice, {passphrase: 'alice'})
  var userKeyBob = mtosBob.loadKeyFromStrings(testingKeys.userKeyBob, {passphrase: 'bob'})
  var userKeyEve = mtosEve.loadKeyFromStrings(testingKeys.userKeyEve, {passphrase: 'eve'})

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

  tape('user keys loaded from strings are valid', function (t) {
    return Promise.all([userKeyAlice, userKeyBob, userKeyEve])
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

  tape('user keys are not equal', function (t) {
    return Promise.all([userKeyAlice, userKeyBob, userKeyEve])
    .then(function (keys) {
      t.notEqual(keys[0].publicKeyFingerprint, keys[1].publicKeyFingerprint, 'alice and bob have different fingerprints')
      t.notEqual(keys[1].publicKeyFingerprint, keys[2].publicKeyFingerprint, 'bob and eve have different fingerprints')
      t.notEqual(keys[0].publicKeyFingerprint, keys[2].publicKeyFingerprint, 'alice and eve have different fingerprints')
      t.end()
    })
  })

  tape('can send a swarm message from alice to bob', function (t) {
    mtosBob.channels.addChannel('aliceandbob')
    mtosBob.channels.on('channel-message', function (data) {
      console.log('bob heard', data)
    })
    setTimeout(function () {
      mtosAlice.channels.send({
        channel: 'aliceandbob',
        text: 'here is some text'
      })
    }, 1000)
  })

  tape('can shut down tracker', function (t) {
    tracker.close()
    t.ok(tracker, 'tracker shut down')
    t.end()
  })
})
