import tape from 'tape'

import Identity from './identity'
import * as util from './identity'

tape('secret key', function (t) {
  let id = new Identity()
  t.ok(id.secretKey, 'can generate a secret key')

  id = new Identity(util.generateKey().toString('base64'))

  t.ok(id.secretKey, 'can be created from a base64 secret key')
  t.end()
})

tape('id can be converted toJSON()', function (t) {
  // Do a JSON.stringify and JSON.parse on an Object
  function parse (object) {
    return JSON.parse(
      JSON.stringify(object)
    )
  }

  let id = new Identity()

  let idSecret = parse(id)
  t.ok(idSecret.secretKey, 'JSON.stringify(id) includes secretKey')

  t.end()
})
