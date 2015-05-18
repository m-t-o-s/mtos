'use strict'

var q = require('q')
var JSZip = require('jszip')

var mtos = {}

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
  zip.file('mtos-data.json', data)
  var zipfile = zip.generate({type: 'nodebuffer'})
  deferred.resolve(zipfile)
  return deferred.promise
}

mtos.signContent = mtos.crypter.signContent
mtos.encryptContent = mtos.crypter.encryptContent

mtos.createContent = function (content, options) {
  console.log('creating', content, options)
  var contentString = JSON.stringify(content)
  return mtos.signContent(contentString, options.privateKey)
  .then(function (signedContent) {
    var signedContentString = JSON.stringify(signedContent)
    if (options.encrypt) {
      return mtos.encryptContent(signedContentString, options.publicKey)
    } else {
      var deferred = q.defer()
      deferred.resolve(signedContentString)
      return deferred.promise
    }
  })
  .then(function (finalContent) {
    var content = JSON.stringify({
      message: finalContent,
      author: options.author
    })
    console.log('about to zip', content)
    return mtos.createZip(content)
  })
  .then(function (zipfile) {
    var deferred = q.defer()
    mtos.torrentClient.seed(zipfile, { name: 'mtos-data.zip' }, function (torrent) {
      deferred.resolve(torrent)
    })
    return deferred.promise
  })
  .then(function (torrent) {
    console.log('created torrent', torrent)
  })
}

mtos.newServerKey = mtos.crypter.generateKeyPair

mtos.newUserKey = mtos.crypter.generateKeyPair

mtos.loadKeyFromStrings = mtos.crypter.loadKeyFromStrings

module.exports = mtos
