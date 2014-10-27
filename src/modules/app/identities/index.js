'use strict';

module.exports =
  angular.module('mtos.identities', [
    //load your foo submodules here, e.g.:
    //require('./bar').name
    //'LocalForageModule',
    //'uuid4',
  ])
  .config(function ($stateProvider) {
    $stateProvider
    .state('identities', {
      url: '/identities',
      templateUrl: 'app/identities/layout.html',
      controller: 'identitiesController'
    });
  })
  .controller('addController', require('./addController'))
  .controller('unlockController', require('./unlockController'))
  .controller('identitiesController', require('./identitiesController'));
