'use strict';

module.exports = /*@ngInject*/
  function openpgpService($q /* inject dependencies here, i.e. : $rootScope */) {
    var openpgp = require('openpgp');
    var openpgpProxy = new openpgp.AsyncProxy('assets/openpgp.worker.js');
    return {
      pgp: openpgp,
      proxy: openpgpProxy
    };
  };
