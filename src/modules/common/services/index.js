'use strict';

module.exports =
  angular.module('mtos.common.services', [])
  .factory('openpgp', require('./openpgpService'))
  .factory('identitiesService', require('./identitesService.js'))
  .factory('screenOwnership', require('./screenOwnershipService.js'));
  //.factory('fooService', require('./fooService'));
