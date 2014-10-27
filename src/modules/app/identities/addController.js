'use strict';

module.exports = /*@ngInject*/
  function addController($scope, $modalInstance) {
    $scope.creator = {
      userid: '',
      passphrase: ''
    }

    $scope.ok = function(){
      $modalInstance.close($scope.creator);
    };
    $scope.cancel = function(){
      $modalInstance.dismiss('cancel');
    }
  };
