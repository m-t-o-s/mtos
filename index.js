'use strict'

require('es6-promise').polyfill()

var events = require('events')
var JSZip = require('jszip')
var WebTorrent = require('webtorrent')
var friendsSwarm = require('friends-swarm')
var level = require('level-browserify')
var sublevel = require('subleveldown')
var Crypter = require('./lib/crypter')
var Archiver = require('./lib/archiver')

/**
 * Initialize an MTOS instance
 * @constructor
 * @param {object} options
 * @param {object} options.key
 * @param {string} options.key.publicKey A base64 encoded public key string
 * @param {string} options.key.privateKey A base64 encoded private key string
 * @param {array} options.hubs A list of URLs for signahubs to connect through
 * @param {array} options.trackers A list of URLs for webtorrent to use when finding peers
 * @returns {object} An Event Emitter
 * @example
 * var MTOS = require('mtos')
 * var mtos = new MTOS({
 *   hubs: ['http://hub.mtos.co'],
 *   trackers: ['ws://tracker.mtos.co'],
 *   key: {
 *     publicKey: '...',
 *     privateKey: '...'
 *     }
 * })
 */

var MTOS = function (options) {
  if (!(this instanceof MTOS)) return new MTOS(options)
  if (!options) options = {}

  var emitter = new events.EventEmitter()

  var self = emitter

  var crypter = new Crypter(self)

  self.primeGenerated = crypter.generatePrime()
  .then(function () {
    console.log('prime generated')
    self.emit('prime generated')
    return Promise.resolve()
  })

  if (!options.key) {
    // FIXME: not ready to implement yet
    // throw new Error('No key supplied during intialization')
  }

  if (!options.keystore) {
    options.keystore = level('./mtdata-keystore')
  }
  self.keystore = options.keystore

  if (!options.db) {
    options.db = level('./mtdata-database')
  }
  self.db = options.db

  var mtosOptions = {
    swarmOptions: {
      hubs: options.hubs,
      wrtc: require('wrtc'),
      namespace: 'mtos'
    },
    torrentOptions: {
      announce: options.trackers
    }
  }

  self.channels = friendsSwarm(sublevel(options.db, 'swarm'), mtosOptions.swarmOptions)

  self.channels.process(function (message, cb) {
    self.channels.emit('channel-message', message)
    cb()
  })

  self.torrentClient = new WebTorrent()

  var subscriptionDB = sublevel(options.db, 'subscriptions')

  self.addSubscription = function () {
  }

  self.getSubscriptions = function () {
    var response = {}
    return new Promise(function (resolve, reject) {
      subscriptionDB.createReadStream()
      .on('data', function (data) {
        response[data.key] = data.value
      })
      .on('error', function (error) {
        reject(error)
      })
      .on('end', function () {
        resolve(response)
      })
    })
  }

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
    .then(function (contentString) {
      return JSON.parse(contentString)
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
          console.log('error', error)
          throw new Error(error)
        }
        resolve(buffer)
      })
    })
    return promise
  }

  self.generateServerKey = crypter.generateKeyPair

  self.newUserKey = crypter.generateKeyPair
  self.generateKeyPair = crypter.generateKeyPair

  self.getIdentities = function () {
    var identities = []
    return new Promise(function (resolve, reject) {
      self.keystore.createReadStream()
      .on('data', function (data) {
        var value = JSON.parse(data.value)
        identities.push(value)
      })
      .on('error', function (error) {
        reject(error)
      })
      .on('close', function () {
        resolve(identities)
      })
    })
  }

  self.saveIdentity = function (keypair) {
    var record = {
      username: keypair.username,
      publicKeyFingerprint: keypair.publicKeyFingerprint,
      publicKeyHash: keypair.publicKeyHash,
      publicKeyString: keypair.publicKeyString,
      privateKeyString: keypair.privateKeyString
    }
    return new Promise(function (resolve, reject) {
      self.keystore.put(record.publicKeyHash, JSON.stringify(record), function (error) {
        if (error) reject(error)
        resolve()
      })
    })
  }

  self.deleteIdentity = function (keyHash) {
    return new Promise(function (resolve, reject) {
      console.log('deleteing', keyHash)
      self.keystore.del(keyHash, function (error, value) {
        if (error) reject(error)
        resolve()
      })
    })
  }

  self.loadIdentity = function (publicKeyHash) {
    return new Promise(function (resolve, reject) {
      console.log('loading', publicKeyHash)
      self.keystore.get(publicKeyHash, function (error, value) {
        if (error) reject(error)
        resolve(JSON.parse(value))
      })
    })
  }

  self.unlockIdentity = function (keyStrings, passphrase) {
    var options = {
      passphrase: passphrase
    }
    return crypter.loadKeyFromStrings(keyStrings, options)
    .then(function (key) {
      self.identity = key
      self.emit('identified')
      return key
    })
  }

  self.deAuth = function () {
    self.identity = undefined
    self.emit('deauth')
  }

  self.publicKeyFromString = crypter.publicKeyFromString

  self.generateSharedPrivate = crypter.generateSharedPrivate

  self.deriveSharedSecret = crypter.deriveSharedSecret

  self.archiver = new Archiver(self)

  return self
}

module.exports = MTOS
