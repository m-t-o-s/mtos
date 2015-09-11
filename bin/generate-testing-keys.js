'use strict'

var mtos = require('../')
var fs = require('fs')
var path = require('path')

var testingKeys = {}
var serverKeyOne = mtos.generateServerKey()
var serverKeyTwo = mtos.generateServerKey()

var optionsAlice = {
  username: 'alice',
  passphrase: 'alice'
}
var optionsBob = {
  username: 'bob',
  passphrase: 'bob'
}
var optionsEve = {
  username: 'eve',
  passphrase: 'eve'
}

var userKeyAlice = mtos.newUserKey(optionsAlice)
var userKeyBob = mtos.newUserKey(optionsBob)
var userKeyEve = mtos.newUserKey(optionsEve)

console.log('generating testing keys')

Promise.all([serverKeyOne, serverKeyTwo, userKeyAlice, userKeyBob, userKeyEve])
.then(function (keys) {
  var promise = new Promise(function (resolve, reject) {
    for (var i = 0; i < keys.length; ++i) {
      delete keys[i].privateKey
      delete keys[i].publicKey
    }

    // Server Keys
    testingKeys.serverKeyOne = keys[0]
    testingKeys.serverKeyTwo = keys[1]

    // User Keys
    testingKeys.userKeyAlice = keys[2]
    testingKeys.userKeyBob = keys[3]
    testingKeys.userKeyEve = keys[4]
    fs.writeFileSync(path.join(__dirname + '/../test/testing-keys.json'),
                     JSON.stringify(testingKeys, null, 4), 'utf-8')
    resolve(testingKeys)
  })
  return promise
})
.then(function () {
  console.log('generated testing keys')
  process.exit()
})
