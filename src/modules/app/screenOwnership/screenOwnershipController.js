'use strict';

module.exports = /*@ngInject*/
  function screenOwnershipController($scope, serverEnvironment, screenOwnership, $cordovaBarcodeScanner, $modal, $q) {

    $scope.domainURI = serverEnvironment.domainURI;

    function sendScreenRequest(targetScreenID) {
      var thisScreenID = $scope.screenID;
      screenOwnership.requestScreen(targetScreenID,thisScreenID)
      .then(function(res){
      })
    }

    $scope.scanBarCode = function() {

      if (cordova.plugins) {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
          var targetScreenID = imageData.text
          .replace(serverEnvironment.domainURI+'/screen/', '');
          sendScreenRequest(targetScreenID);
        }, function(err) {
          // An error occured. Show a message to the user
        });
      } else {
        $scope.scanQRCodeHTML5()
        .then(function(imageData){
          var targetScreenID = imageData
          .replace(serverEnvironment.domainURI+'/screen/', '');
          sendScreenRequest(targetScreenID);
        })
      }
    };

    $scope.scanQRCodeHTML5 = function scanQRCodeHTML5(){
      var deferred = $q.defer();
      var scannerModal = $modal.open({
        templateUrl: 'app/screenOwnership/scannerModal.html',
        controller: 'scannerModalController',
        size: 'lg'
      });
      scannerModal.result.then(function(imageData){
        deferred.resolve(imageData);
      });
      return deferred.promise;
    };

    window.ss = $scope;

    $scope.screenID = undefined;
    $scope.screenKeys = 'not yet set';

    screenOwnership.getScreenID()
    .then(function(screenID){
      $scope.screenID = screenID;
      screenOwnership.getScreenKeys(screenID)
      .then(function(screenKeys){
        $scope.screenKeys = screenKeys;
        screenOwnership.connection(screenID)
        .then(function(res){
//          $scope.scannedText = angular.toJson(res);
        })
      });
    });
    /*
    {
      public_key: 'not yet set'
    };
    */



  };
