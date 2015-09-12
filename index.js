'use strict'

require('es6-promise').polyfill()

var events = require('events')
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
  var promise = new Promise(function (resolve, reject) {
    torrent.files[0].getBuffer(function (error, buffer) {
      if (error) {
        throw new Error(error)
      }
      resolve(buffer.toString('utf-8'))
    })
  })
  return promise
}

MTOS.createZip = function (data) {
  var promise = new Promise(function (resolve, reject) {
    var zip = new JSZip()
    zip.file('mt-data', data)
    var zipfile = zip.generate({type: 'nodebuffer'})
    resolve(zipfile)
  })
  return promise
}

MTOS.readZip = function (data) {
  var promise = new Promise(function (resolve, reject) {
    console.log('reading zip content', data)
    var zip = new JSZip(data)
    var content = zip.file('mt-data').asText()
    resolve(content)
  })
  return promise
}

MTOS.signContent = MTOS.crypter.signContent
MTOS.encryptContent = MTOS.crypter.encryptContent

MTOS.createContent = function (content, options) {
  var contentString = content
  return MTOS.signContent(contentString, options.privateKey)
  .then(function (signedContent) {
    var signedContentString = signedContent
    if (options.encrypt) {
      return MTOS.encryptContent(signedContentString, options.publicKey)
    } else {
      var promise = new Promise(function (resolve, reject) {
        resolve(signedContentString)
      })
      return promise
    }
  })
  .then(function (finalContent) {
    var content = finalContent
    return MTOS.createZip(content)
  })
  .then(function (zipfile) {
    var promise = new Promise(function (resolve, reject) {
      var torrentOptions = {name: 'mt-data.zip'}
      if (options.torrentOptions) {
        torrentOptions.announce = options.torrentOptions.announce
      }
      MTOS.torrentClient.seed(zipfile, torrentOptions, function (torrent) {
        resolve(torrent)
      })
    })
    return promise
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
  var promise = new Promise(function (resolve, reject) {
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
      resolve(buffer)
    })
  })
  return promise
}

MTOS.generateServerKey = MTOS.crypter.generateKeyPair

MTOS.newUserKey = MTOS.crypter.generateKeyPair

MTOS.loadKeyFromStrings = MTOS.crypter.loadKeyFromStrings

MTOS.publicKeyFromString = MTOS.crypter.publicKeyFromString

MTOS.generateSharedPrivate = MTOS.crypter.generateSharedPrivate

MTOS.deriveSharedSecret = MTOS.crypter.deriveSharedSecret

module.exports = MTOS
