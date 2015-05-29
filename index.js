'use strict'

var events = require('events')
var q = require('q')
var JSZip = require('jszip')

var MTOS = function (options) {
  if (!(this instanceof MTOS)) return new MTOS(options)
  if (!options) options = {}

  events.EventEmitter.call(this)
}

MTOS.connect = require('./lib/swarm')
MTOS.torrentClient = require('./lib/webtorrent')
MTOS.crypter = require('./lib/crypter')

MTOS.readTextFile = function (torrent) {
  var deferred = q.defer()
  torrent.files[0].getBuffer(function (error, buffer) {
    if (error) {
      throw new Error(error)
    }
    deferred.resolve(buffer.toString('utf-8'))
  })
  return deferred.promise
}

MTOS.createZip = function (data) {
  var deferred = q.defer()
  var zip = new JSZip()
  zip.file('mt-data', data)
  var zipfile = zip.generate({type: 'nodebuffer'})
  deferred.resolve(zipfile)
  return deferred.promise
}

MTOS.readZip = function (data) {
  console.log('reading zip content', data)
  var deferred = q.defer()
  var zip = new JSZip(data)
  var content = zip.file('mt-data').asText()
  deferred.resolve(content)
  return deferred.promise
}

MTOS.signContent = MTOS.crypter.signContent
MTOS.encryptContent = MTOS.crypter.encryptContent

MTOS.createContent = function (content, options) {
  console.log('creating content', content, options)
  var contentString = content
  return MTOS.signContent(contentString, options.privateKey)
  .then(function (signedContent) {
    var signedContentString = signedContent
    if (options.encrypt) {
      return MTOS.encryptContent(signedContentString, options.publicKey)
    } else {
      var deferred = q.defer()
      deferred.resolve(signedContentString)
      return deferred.promise
    }
  })
  .then(function (finalContent) {
    var content = finalContent
    console.log('about to zip', content)
    return MTOS.createZip(content)
  })
  .then(function (zipfile) {
    var deferred = q.defer()
    var torrentOptions = {name: 'mt-data.zip'}
    if (options.torrentOptions) {
      console.log('TORRENT OPTIONS', torrentOptions, options.torrentOptions)
      torrentOptions.announceList = options.torrentOptions.announceList
      console.log('TORRENT OPTIONS', JSON.stringify(torrentOptions, null, 2))

    }
    MTOS.torrentClient.seed(zipfile, torrentOptions, function (torrent) {
      deferred.resolve(torrent)
    })
    return deferred.promise
  })
  .then(function (torrent) {
    console.log('created torrent', torrent)
    return torrent
  })
}

MTOS.decryptContent = MTOS.crypter.decryptContent
MTOS.verifyContent = MTOS.crypter.verifyContent

MTOS.readContent = function (torrent, options) {
  return MTOS.torrentToBuffer(torrent)
  .then(function (mtZipBuffer) {
    return MTOS.readZip(mtZipBuffer)
  })
  .then(function (mtData) {
    console.log('read from zip', mtData)
    return MTOS.decryptContent(mtData, options.privateKey)
  })
  .then(function (content) {
    return MTOS.verifyContent(content, options.publicKey)
  })
}

MTOS.torrentToBuffer = function (torrent) {
  var deferred = q.defer()
  console.log('beginning torrent read cycle', torrent)
  var mtZip
  for (var i = 0; i < torrent.files.length; i++) {
    if (torrent.files[i].path === 'mt-data.zip') {
      mtZip = torrent.files[i]
    }
  }
  mtZip.getBuffer(function (error, buffer) {
    if (error) {
      throw new Error(error)
    }
    deferred.resolve(buffer)
  })
  return deferred.promise
}

MTOS.newServerKey = MTOS.crypter.generateKeyPair

MTOS.newUserKey = MTOS.crypter.generateKeyPair

MTOS.loadKeyFromStrings = MTOS.crypter.loadKeyFromStrings

MTOS.publicKeyFromString = MTOS.crypter.publicKeyFromString

module.exports = MTOS
