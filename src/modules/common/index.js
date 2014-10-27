'use strict';

module.exports =
  angular.module('mtos.common', [
    require('./directives').name,
    require('./filters').name,
    require('./services').name
  ])
  .constant('serverEnvironment', {
    domainString: "192.168.1.151:8080",
    domainProtocol: "http",
    domainURI: 'http://192.168.1.151:8080'
  });
