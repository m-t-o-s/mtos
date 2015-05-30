'use strict'

var mtos = require('../')
var q = require('q')
var fs = require('fs')
var path = require('path')

var testingKeys = {}
var serverKeyOne = mtos.generateServerKey()
var serverKeyTwo = mtos.generateServerKey()

console.log('generating testing keys')

q.all([serverKeyOne, serverKeyTwo])
.then(function (serverKeys) {
  var deferred = q.defer()
  delete serverKeys[0].privateKey
  delete serverKeys[0].publicKey
  delete serverKeys[1].privateKey
  delete serverKeys[1].publicKey
  testingKeys.serverKeyOne = serverKeys[0]
  testingKeys.serverKeyTwo = serverKeys[1]
  fs.writeFileSync(path.join(__dirname + '/../test/testing-keys.json'),
                   JSON.stringify(testingKeys, null, 4), 'utf-8')
  deferred.resolve(testingKeys)
  return deferred.promise
})
.finally(function () {
  console.log('generated testing keys')
  process.exit()
})
