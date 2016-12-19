import tape from 'tape'

import * as id from './identity'

tape('key can be generated', function(t) {
  t.equal('working', id.generateKey(), 'it\'s working')
  t.end()
})
