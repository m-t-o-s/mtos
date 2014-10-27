'use strict';

module.exports =
  angular.module('mtos.foo', [
    //load your foo submodules here, e.g.:
    //require('./bar').name
    'LocalForageModule',
    'uuid4',
    'tiago.qrcode'
  ])
  .config(function ($stateProvider, $localForageProvider) {
    $stateProvider
    .state('foo', {
      url: '',
      templateUrl: 'app/foo/layout.html',
      controller: 'fooController'
    });
    $localForageProvider.config({
      name: 'what' // name of the database and prefix for your data
    });
  })
  .controller('fooController', require('./fooController'));
