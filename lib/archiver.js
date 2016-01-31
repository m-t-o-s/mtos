'use strict'

require('es6-promise').polyfill()

var JSZip = require('jszip')

var Archiver = function (mtos) {
  if (!(this instanceof Archiver)) return new Archiver(mtos)

  var self = this

  self.archiveIdentity = function () {
    var data = {}
    return mtos.loadIdentity(mtos.identity.publicKeyHash)
    .then(function (identity) {
      data.identity = identity
      return Promise.resolve(identity)
    })
    .then(function (identity) {
      var zip = new JSZip()
      var folder = zip.folder('mtos-backup')
      folder.file('identity.json', JSON.stringify(data, null, '  '))
      var blob = zip.generate({type: 'blob'})
      return Promise.resolve(blob)
    })
  }

  self.loadIdentityFromZip = function (file) {
    var unzip = new JSZip(file)
    var data = JSON.parse(unzip.file('mtos-backup/identity.json').asText())
    return mtos.saveIdentity(data.identity)
    .then(function () {
      Promise.resolve(data.identity)
    })
  }
}

module.exports = Archiver
