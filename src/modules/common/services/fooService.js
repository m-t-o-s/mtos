'use strict';

module.exports = /*@ngInject*/
  function fooService($q /* inject dependencies here, i.e. : $rootScope */) {
    var kbpgp = require('kbpgp');
    return kbpgp;
  };
