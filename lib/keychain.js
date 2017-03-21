// import encryption from 'sodium-encryption'

// import { bufferFromBase64 } from './util'

export default class Keychain {
  constructor (keys) {
    if (!keys) {
      this.keys = []
    } else {
      this.keys = keys
    }
  }
  add (identity) {
    this.keys.push(identity)
  }
  toJSON () {
    return {
      keys: this.keys
    }
  }
}
