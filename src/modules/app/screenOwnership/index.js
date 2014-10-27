'use strict';

module.exports =
  angular.module('mtos.screenOwnership', [
    //load your foo submodules here, e.g.:
    //require('./bar').name
    'LocalForageModule',
    'uuid4',
    'tiago.qrcode',
    'webcam'
  ])
  .config(function ($stateProvider) {
    $stateProvider
    .state('welcome', {
      url: '',
      templateUrl: 'app/screenOwnership/layout.html',
      controller: 'screenOwnershipController'
    });
  })
  .controller('scannerModalController', require('./scannerModalController'))
  .controller('screenOwnershipController', require('./screenOwnershipController'));
