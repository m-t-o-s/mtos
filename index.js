'use strict'

require('es6-promise').polyfill()

var events = require('events')
var JSZip = require('jszip')
var WebTorrent = require('webtorrent')
var crypter = require('./lib/crypter')

var MTOS = function (options) {
  if (!(this instanceof MTOS)) return new MTOS(options)
  if (!options) options = {}

  var self = this

  events.EventEmitter.call(this)

  self.connect = require('./lib/swarm')
  self.torrentClient = new WebTorrent()

  self.readTextFile = function (torrent) {
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

  self.createZip = function (data) {
    var promise = new Promise(function (resolve, reject) {
      var zip = new JSZip()
      zip.file('mt-data', data)
      var zipfile = zip.generate({type: 'nodebuffer'})
      resolve(zipfile)
    })
    return promise
  }

  self.readZip = function (data) {
    var promise = new Promise(function (resolve, reject) {
      var zip = new JSZip(data)
      var content = zip.file('mt-data').asText()
      resolve(content)
    })
    return promise
  }

  self.signContent = crypter.signContent
  self.encryptContent = crypter.encryptContent

  self.createContent = function (content, options) {
    var contentString = content
    return self.signContent(contentString, options.privateKey)
    .then(function (signedContent) {
      var signedContentString = signedContent
      if (options.encrypt) {
        return self.encryptContent(signedContentString, options.publicKey)
      } else {
        var promise = new Promise(function (resolve, reject) {
          resolve(signedContentString)
        })
        return promise
      }
    })
    .then(function (finalContent) {
      var content = finalContent
      return self.createZip(content)
    })
    .then(function (zipfile) {
      var promise = new Promise(function (resolve, reject) {
        var torrentOptions = {name: 'mt-data.zip'}
        if (options.torrentOptions) {
          torrentOptions.announce = options.torrentOptions.announce
        }
        self.torrentClient.seed(zipfile, torrentOptions, function (torrent) {
          resolve(torrent)
        })
      })
      return promise
    })
    .then(function (torrent) {
      return torrent
    })
  }

  self.decryptContent = crypter.decryptContent
  self.verifyContent = crypter.verifyContent

  self.downloadTorrent = function (id, options) {
    var promise = new Promise(function (resolve, reject) {
      self.torrentClient.add(id, function (torrent) {
        resolve(torrent)
      })
    })
    .catch(function (error) {
      console.log('add torrent error', error)
    })
    return promise
  }

  self.readContent = function (torrentID, options) {
    return self.downloadTorrent(torrentID, options)
    .then(function (torrent) {
      return self.torrentToBuffer(torrent)
    })
    .then(function (mtZipBuffer) {
      return self.readZip(mtZipBuffer)
    })
    .then(function (mtData) {
      return self.decryptContent(mtData, options.privateKey)
    })
    .then(function (content) {
      return self.verifyContent(content, options.publicKey)
    })
  }

  self.torrentToBuffer = function (torrent) {
    var promise = new Promise(function (resolve, reject) {
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

  self.generateServerKey = crypter.generateKeyPair

  self.newUserKey = crypter.generateKeyPair

  self.loadKeyFromStrings = crypter.loadKeyFromStrings

  self.publicKeyFromString = crypter.publicKeyFromString

  self.generateSharedPrivate = crypter.generateSharedPrivate

  self.deriveSharedSecret = crypter.deriveSharedSecret
}

module.exports = MTOS
