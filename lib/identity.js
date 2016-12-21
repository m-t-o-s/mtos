import encryption from 'sodium-encryption'

export function generateKey () {
  return encryption.key()
}

export function keyFromBase64 (keyString) {
  return Buffer.from(keyString, 'base64')
}

export default class Identity {
  constructor (secretKey) {
    if (!secretKey) {
      this.secretKey = generateKey()
    } else {
      this.secretKey = keyFromBase64(secretKey)
    }
  }
  toJSON () {
    return {
      secretKey: this.secretKey.toString('base64')
    }
  }
}
