import encryption from 'sodium-encryption'

import { bufferFromBase64 } from './util'

export function generateKey () {
  return encryption.key()
}

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
