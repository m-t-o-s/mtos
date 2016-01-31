'use strict'

// FIXME: is this a bad idea?
var forge = global.forge = (global.forge || require('node-forge'))

var rsa = forge.pki.rsa

var Crypter = function (mtos) {
  if (!(this instanceof Crypter)) return new Crypter(mtos)

  var self = this
  var crypter = self

  crypter.forgeKeyPair = function (options) {
    if (!options) {
      options = {
        bits: 2048,
        workers: -1
      }
    }
    return new Promise(function (resolve, reject) {
      rsa.generateKeyPair(options, function (error, keypair) {
        if (error) {
          throw new Error(error)
        }
        resolve(keypair)
      })
    })
  }

  /**
   * generate a keypair
   * @memberof MTOS
   * @param {object} options for forge keypair generation function
   * @param {number} options.bits keypair size
   * @param {number} options.workers Number of web workers to use. -1 is to automatically calculate ideal number of workers
   * @returns {object} a forge keypair with encrypt and decrypt functions
   * @example
   * mtos.generateKeyPair({
   *   bits: 2048,
   *   workers: -1
   * })
   */
  crypter.generateKeyPair = function (options) {
    return crypter.forgeKeyPair(options)
    .then(function (keypair) {
      var promise = new Promise(function (resolve, reject) {
        var publicKeyFingerprint = global.forge.pki.getPublicKeyFingerprint(keypair.publicKey, {encoding: 'hex', delimiter: ':'})
        var md = forge.md.sha512.create()
        md.update(publicKeyFingerprint.replace(':', ''))
        var publicKeyHash = md.digest().toHex()
        var returnKey = {
          publicKey: keypair.publicKey,
          privateKey: keypair.privateKey,
          publicKeyFingerprint: publicKeyFingerprint,
          publicKeyHash: publicKeyHash,
          publicKeyString: global.forge.pki.publicKeyToPem(keypair.publicKey),
          privateKeyString: global.forge.pki.privateKeyToPem(keypair.privateKey)
        }
        if (options && options.username) {
          returnKey.username = options.username
        }
        if (options && options.passphrase) {
          returnKey.privateKeyString = global.forge.pki.encryptRsaPrivateKey(returnKey.privateKey, options.passphrase)
        }
        resolve(returnKey)
      })
      return promise
    })
  }

  crypter.loadKeyFromStrings = function (keyStrings, options) {
    return new Promise(function (resolve, reject) {
      var publicKey = forge.pki.publicKeyFromPem(keyStrings.publicKeyString)
      var privateKey
      if (options && options.passphrase) {
        privateKey = forge.pki.decryptRsaPrivateKey(keyStrings.privateKeyString, options.passphrase)
      } else {
        privateKey = forge.pki.privateKeyFromPem(keyStrings.privateKeyString)
      }
      var usableKeys = {
        username: keyStrings.username,
        publicKeyHash: keyStrings.publicKeyHash,
        publicKeyString: keyStrings.publicKeyString,
        privateKeyString: keyStrings.privateKeyString,
        publicKeyFingerprint: keyStrings.publicKeyFingerprint,
        privateKey: privateKey,
        publicKey: publicKey
      }
      resolve(usableKeys)
    })
  }

  crypter.publicKeyFromString = function (string) {
    var promise = new Promise(function (resolve, reject) {
      resolve(forge.pki.publicKeyFromPem(string))
    })
    return promise
  }

  crypter.signContent = function (content, privateKey) {
    var promise = new Promise(function (resolve, reject) {
      var contentString = JSON.stringify(content)
      var digest = forge.md.sha256.create()
      digest.update(contentString, 'utf-8')
      resolve(JSON.stringify({
        message: contentString,
        signature: forge.util.encode64(privateKey.sign(digest))
      }))
    })
    return promise
  }

  crypter.verifyContent = function (content, publicKey) {
    var promise = new Promise(function (resolve, reject) {
      var parsedContent = JSON.parse(content)
      var signature = forge.util.decode64(parsedContent.signature)
      var md = forge.md.sha256.create()
      md.update(parsedContent.message, 'utf-8')
      try {
        publicKey.verify(md.digest().bytes(), signature)
        resolve(parsedContent.message)
      } catch (error) {
        console.log(error)
        reject(new Error(error))
      }
    })
    return promise
  }

  crypter.encryptContent = function (content, publicKey) {
    var promise = new Promise(function (resolve, reject) {
      var envelope = forge.pkcs7.createEnvelopedData()
      var certificate = forge.pki.createCertificate()
      certificate.publicKey = publicKey
      envelope.addRecipient(certificate)
      envelope.content = forge.util.createBuffer(JSON.stringify(content))
      envelope.encrypt()
      var pem = forge.pkcs7.messageToPem(envelope)
      resolve(pem)
    })
    return promise
  }

  crypter.decryptContent = function (message, privateKey) {
    var promise = new Promise(function (resolve, reject) {
      var envelope = forge.pkcs7.messageFromPem(message)
      envelope.decrypt(envelope.recipients[0], privateKey)
      resolve(JSON.parse(envelope.content.data))
    })
    return promise
  }

  crypter.generatePrime = function () {
    var options = {
      algorithm: {
        name: 'PRIMEINC',
        worker: -1
      }
    }
    return new Promise(function (resolve, reject) {
      forge.prime.generateProbablePrime(2048, options, function (error, prime) {
        if (error) reject(error)
        mtos.prime = forge.util.encode64(forge.util.hexToBytes(prime.toString(16)))
        resolve(mtos.prime)
      })
    })
  }

  var crypto = require('diffie-hellman')

  crypter.generateSharedPrivate = function (b64Prime) {
    var dh
    var promise = function () {
      return new Promise(function (resolve, reject) {
        dh.generateKeys()
        var publicKey = dh.getPublicKey('base64')
        var privateKey = dh.getPrivateKey('base64')
        var prime = dh.getPrime('base64')
        resolve({
          privateKey: privateKey,
          publicKey: publicKey,
          prime: prime
        })
      })
    }
    if (b64Prime) {
      dh = crypto.createDiffieHellman(b64Prime, 'base64')
      return promise()
    } else {
      return mtos.primeGenerated
      .then(function () {
        dh = crypto.createDiffieHellman(mtos.prime)
        return promise()
      })
    }
  }

  crypter.deriveSharedSecret = function (privateKnowledge, publicKey) {
    var promise = new Promise(function (resolve, reject) {
      var dh = crypto.createDiffieHellman(privateKnowledge.prime, 'base64')
      dh.setPrivateKey(privateKnowledge.privateKey, 'base64')
      dh.setPublicKey(privateKnowledge.publicKey, 'base64')
      var sharedKey = dh.computeSecret(publicKey, 'base64', 'base64')
      resolve(sharedKey)
    })
    return promise
  }
}

module.exports = Crypter
