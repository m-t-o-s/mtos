import tape from 'tape'

import Identity from './identity'

import Keychain, * as util from './keychain'

tape('can store new relationship', function (t) {
  let keychain = new Keychain()
  keychain.add(new Identity())
  t.ok(keychain.keys.length === 1, 'key was added successfully')
  t.end()
})

tape('it can be converted toJSON()', function (t) {
  // Do a JSON.stringify and JSON.parse on an Object
  function parse (object) {
    return JSON.parse(
      JSON.stringify(object)
    )
  }
  let keychain = new Keychain()
  t.ok(parse(keychain).keys, 'can find keys attribute in keychain')
  t.ok(parse(keychain).keys.length >= 0, 'keys attribute is an array')
  t.end()
})

tape('it can be loaded from JSON', function (t) {
  // Do a JSON.stringify and JSON.parse on an Object
  function parse (object) {
    return JSON.parse(
      JSON.stringify(object)
    )
  }
  let keychain = new Keychain([
    new Identity(),
    new Identity()
  ])
  t.ok(parse(keychain).keys, 'can find keys attribute in keychain')
  t.ok(parse(keychain).keys.length >= 0, 'keys attribute is an array')
  t.end()
})
