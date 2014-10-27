'use strict';

module.exports = /*@ngInject*/
  function identitiesController($scope, $localForage, $modal, identitiesService, openpgp, $q, $rootScope, usSpinnerService) {

    $localForage.bind($scope, {
      key: 'identities',
      defaultValue: [],
      storeName: 'identities'
    })
    .then(function(identities){
      if (identities === null){
        $scope.identities = [];
        $scope.addIdentity();
      } else {
        if (identities[0] === undefined) $scope.addIdentity();
      }
    });

    $scope.addIdentity = function addIdentity(){
      var newIdentityModal = $modal.open({
        templateUrl: 'app/identities/add.html',
        controller: 'addController',
        size: 'lg'
      });
      newIdentityModal.result.then(function(creator){
        usSpinnerService.spin('generating-keys');
        identitiesService.generateKeys(creator.userid, creator.passphrase)
        .then(function(keys){
          $scope.identities.push(keys);
          usSpinnerService.stop('generating-keys');
        });
      });
    };
  };
