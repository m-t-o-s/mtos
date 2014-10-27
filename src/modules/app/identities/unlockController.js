'use strict';

module.exports = /*@ngInject*/
  function unlockController($scope, $modalInstance) {
    $scope.pass = {
      phrase: ''
    };
    $scope.ok = function(){
      $modalInstance.close($scope.pass.phrase);
    };
    $scope.cancel = function(){
      $modalInstance.dismiss('cancel');
    }
  };
