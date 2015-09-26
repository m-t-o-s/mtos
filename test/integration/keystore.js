'use strict'

var tape = require('tape')
console.log(tape)

var MTOS = require('../../')

var mtos = new MTOS()

var keyOptions = {
  username: 'eve',
  passphrase: 'eve'
}

var keyGenerator = mtos.generateKeyPair(keyOptions)

Promise.all([keyGenerator])
.then(function (array) {
  var key = array[0]
  console.log('key generated', key)
  mtos.saveIdentity(key)
  .then(function () {
    mtos.loadIdentity(key.publicKeyHash)
    .then(function (keypair) {
      console.log('retreived', keypair)
    })
    .catch(function (error) {
      console.log('error loading key', error)
    })
  })
  .catch(function (error) {
    console.log('error saving key', error)
  })
})

