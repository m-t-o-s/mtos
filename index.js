'use strict'

var event = require('events')
var q = require('q')
var JSZip = require('jszip')

var mtos = new event.EventEmitter()

mtos.connect = require('./lib/swarm')
mtos.torrentClient = require('./lib/webtorrent')
mtos.crypter = require('./lib/crypter')

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

mtos.createZip = function (data) {
  var deferred = q.defer()
  var zip = new JSZip()
  zip.file('mt-data', data)
  var zipfile = zip.generate({type: 'nodebuffer'})
  deferred.resolve(zipfile)
  return deferred.promise
}

mtos.readZip = function (data) {
  console.log('reading zip content', data)
  var deferred = q.defer()
  var zip = new JSZip(data)
  var content = zip.file('mt-data').asText()
  deferred.resolve(content)
  return deferred.promise
}

mtos.signContent = mtos.crypter.signContent
mtos.encryptContent = mtos.crypter.encryptContent

mtos.createContent = function (content, options) {
  console.log('creating content', content, options)
  var contentString = content
  return mtos.signContent(contentString, options.privateKey)
  .then(function (signedContent) {
    var signedContentString = signedContent
    if (options.encrypt) {
      return mtos.encryptContent(signedContentString, options.publicKey)
    } else {
      var deferred = q.defer()
      deferred.resolve(signedContentString)
      return deferred.promise
    }
  })
  .then(function (finalContent) {
    var content = finalContent
    console.log('about to zip', content)
    return mtos.createZip(content)
  })
  .then(function (zipfile) {
    var deferred = q.defer()
    var torrentOptions = {name: 'mt-data.zip'}
    if (options.torrentOptions) {
      console.log('TORRENT OPTIONS', torrentOptions, options.torrentOptions)
      torrentOptions.announceList = options.torrentOptions.announceList
      console.log('TORRENT OPTIONS', JSON.stringify(torrentOptions, null, 2))

    }
    mtos.torrentClient.seed(zipfile, torrentOptions, function (torrent) {
      deferred.resolve(torrent)
    })
    return deferred.promise
  })
  .then(function (torrent) {
    console.log('created torrent', torrent)
    return torrent
  })
}

mtos.decryptContent = mtos.crypter.decryptContent
mtos.verifyContent = mtos.crypter.verifyContent

mtos.readContent = function (torrent, options) {
  return mtos.torrentToBuffer(torrent)
  .then(function (mtZipBuffer) {
    return mtos.readZip(mtZipBuffer)
  })
  .then(function (mtData) {
    console.log('read from zip', mtData)
    return mtos.decryptContent(mtData, options.privateKey)
  })
  .then(function (content) {
    return mtos.verifyContent(content, options.publicKey)
  })
}

mtos.torrentToBuffer = function (torrent) {
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

mtos.newServerKey = mtos.crypter.generateKeyPair

mtos.newUserKey = mtos.crypter.generateKeyPair

mtos.loadKeyFromStrings = mtos.crypter.loadKeyFromStrings

mtos.publicKeyFromString = mtos.crypter.publicKeyFromString

module.exports = mtos
