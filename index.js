'use strict'

var Buffer = require('buffer').Buffer
var q = require('q')

var mtos = {}

mtos.torrentClient = require('./lib/webtorrent')
mtos.crypter = require('./lib/crypter')

mtos.createTextFile = function (text) {
  var deferred = q.defer()
  var buffer = new Buffer(Buffer.byteLength(text, 'utf-8'))
  buffer.write(text, 'utf-8')
  mtos.torrentClient.seed(buffer, { name: 'data' }, function (torrent) {
    deferred.resolve(torrent)
  })
  return deferred.promise
}

mtos.readTextFile = function (torrent) {
  var deferred = q.defer()
  torrent.files[0].getBuffer(function (error, buffer) {
    if (error) {
      throw new Error(error)
    }
    deferred.resolve(buffer.toString('utf-8'))
  })
  return deferred.promise
}

mtos.newServerKey = mtos.crypter.generateKeyPair

mtos.newUserKey = mtos.crypter.generateKeyPair

mtos.loadKeyFromStrings = mtos.crypter.loadKeyFromStrings

module.exports = mtos
