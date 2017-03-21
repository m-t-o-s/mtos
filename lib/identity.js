import encryption from 'sodium-encryption'

import { bufferFromBase64 } from './util'

export function generateKey () {
  return encryption.key()
}

/**
 * @module Identity
 * Initialize an Identity
 * @constructor
 * @param {string} base64 encoded 32 bit key
 */
export default class Identity {
  constructor (secretKey) {
    if (!secretKey) {
      this.secretKey = generateKey()
    } else {
      this.secretKey = bufferFromBase64(secretKey)
    }
  }
  toJSON () {
    return {
      secretKey: this.secretKey.toString('base64')
    }
  }
}
