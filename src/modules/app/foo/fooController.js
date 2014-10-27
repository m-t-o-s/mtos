'use strict';

module.exports = /*@ngInject*/
  function fooController($scope, kbpgp, $localForage, uuid4, $q) {
    window.s = $scope ;
    window.u = uuid4;

    $scope.screenKeys = {
      public_key: 'not yet set'
    }

    $localForage.getItem('screenID')
    .then(function(screenID){
      if (screenID===null) {
        $localForage.setItem('screenID', uuid4.generate())
        .then(function(screenID){
          $scope.screenID = screenID;
        });
      } else {
        $scope.screenID = screenID;
      }
    });

    $localForage.getItem('screenKeys')
    .then(function(screenKeys){
      if (screenKeys===null) {
        generateScreenKeys()
        .then(function(keys){
          $localForage.setItem('screenKeys', keys)
          .then(function(screenKeys){
            $scope.screenKeys = screenKeys;
          });
        });
      } else {
        $scope.screenKeys = screenKeys;
      }
    });

    function generateScreenKeys(){
      var deferred = $q.defer();

      var F = kbpgp["const"].openpgp;

      var opts = {
        userid: $scope.screenID,
        primary: {
          nbits: 1024,
          ecc: true,
          flags: F.certify_keys | F.sign_data | F.auth | F.encrypt_comm | F.encrypt_storage,
          expire_in: 0  // never expire
        },
        subkeys: [
          {
          nbits: 512,
          flags: F.sign_data,
          expire_in: 86400 * 365 * 8 // 8 years
        }, {
          nbits: 512,
          flags: F.encrypt_comm | F.encrypt_storage,
          expire_in: 86400 * 365 * 8
        }
        ]
      };

      kbpgp.KeyManager.generate(opts, function(err, key) {
        if (!err) {
          // sign subkeys
          key.sign({}, function(err) {
            var public_key, private_key;
            key.export_pgp_private ({
              passphrase: $scope.screenID
            }, function(err, pgp_private) {
              private_key = pgp_private;
            });
            key.export_pgp_public({}, function(err, pgp_public) {
              public_key = pgp_public;
            });
            console.log('keys generated for '+$scope.screenID);
            deferred.resolve(
              {
                private_key: private_key,
                public_key: public_key
              }
            )
            //console.log($scope.$storage.key.private_key)
          });
        }
      });

      return deferred.promise;
    }
  };
