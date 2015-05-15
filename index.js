
'use strict'

var WebTorrent = require('webtorrent')
var Buffer = require('buffer').Buffer
var q = require('q')

var client = new WebTorrent()

var mtos = {}

mtos.client = client

mtos.createTextFile = function (text) {
  var deferred = q.defer()
  var buffer = new Buffer(1024 * 8)
  buffer.write(text, 'utf-8')
  client.seed(buffer, { name: 'data' }, function (torrent) {
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

module.exports = mtos
