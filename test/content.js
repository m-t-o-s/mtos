'use strict'

var mtos = require('../')
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
  console.log('ADDRESS', tracker.http.address())
})

var testingKeys = require('./testing-keys.json')

var userKeyAlice = mtos.loadKeyFromStrings(testingKeys.userKeyAlice, {passphrase: 'alice'})
var userKeyBob = mtos.loadKeyFromStrings(testingKeys.userKeyBob, {passphrase: 'bob'})
var userKeyEve = mtos.loadKeyFromStrings(testingKeys.userKeyEve, {passphrase: 'eve'})

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

tape('can sign with a private key and verify from a public key', function (t) {
  var keypairs
  var content = {
    secretMessage: 'this content is verifiable'
  }
  return Promise.all([userKeyAlice, userKeyBob])
  .then(function (keys) {
    keypairs = keys
    return mtos.signContent(content, keypairs[1].privateKey)
  })
  .then(function (signedMessage) {
    return mtos.verifyContent(signedMessage, keypairs[1].publicKey)
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
  return Promise.all([userKeyAlice, userKeyBob])
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

tape('can shut down tracker', function (t) {
  trackerListening.then(function () {
    tracker.close()
    t.ok(tracker, 'tracker shut down')
    t.end()
  })
})
