'use strict'

var MTOS = require('../')
var mtos = new MTOS()
var mtosAlice = new MTOS()
var mtosBob = new MTOS()
var mtosEve = new MTOS()
var tape = require('tape')

var TorrentTracker = require('bittorrent-tracker').Server
var tracker = new TorrentTracker({
  http: true
})
tracker.listen(0)
function waitForTracker (event) {
  return new Promise(function (resolve) {
    tracker.on(event, resolve)
  })
}
waitForTracker('error', function (error) {
  console.log('TRACKER ERROR', error)
})
waitForTracker('warning', function (error) {
  console.log('TRACKER warning', error)
})
var trackerListening = waitForTracker('listening').then(function () {
  console.log('ADDRESS', tracker.udp.address())
})

var testingKeys = require('./testing-keys.json')

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

var messageAliceToBob = {
  'data': [{
    'type': 'this-is-a-uuid',
    'id': '1',
    'attributes': {
      'body': 'A simple status message'
    }
  }]
}

var messageAliceToBobURI

tape('can create content signed by alice, encrypted for bob', function (t) {
  trackerListening.then(function () {
    var trackerAddress = 'udp://localhost:' + tracker.udp.address().port
    return Promise.all([userKeyAlice, userKeyBob])
    .then(function (keys) {
      var options = {
        encrypt: true,
        publicKey: keys[1].publicKey,
        privateKey: keys[0].privateKey,
        torrentOptions: {
          announce: [ trackerAddress ]
        }
      }
      return mtosAlice.createContent(messageAliceToBob, options)
    })
    .then(function (torrent) {
      messageAliceToBobURI = torrent.magnetURI
      t.ok(messageAliceToBobURI, 'enerated a magnet uri for alice\'s torrent')
      t.end()
    })
  })
})

tape('can read content signed by alice, encrypted for bob', function (t) {
  trackerListening.then(function () {
    var trackerAddress = 'http://localhost:' + tracker.http.address().port + '/'
    return Promise.all([userKeyAlice, userKeyBob])
    .then(function (keys) {
      var options = {
        publicKey: keys[0].publicKey,
        privateKey: keys[1].privateKey,
        torrentOptions: {
          announce: [ trackerAddress ]
        }
      }
      return mtosBob.readContent(messageAliceToBobURI, options)
    })
    .then(function (torrent) {
      t.end()
    })
  })
})

tape('can shut down tracker', function (t) {
  trackerListening.then(function () {
    tracker.close()
    t.ok(tracker, 'tracker shut down')
    t.end()
  })
})
