'use strict';

module.exports = function($rootScope, $q, $modal, openpgp) {

    if ($rootScope.unlockedIdentities == undefined) $rootScope.unlockedIdentities = [];

    $rootScope.doesHaveUnlockedIdentities = function(){
      var deferred = $q.defer();
      if ($rootScope.unlockedIdentities[0] === undefined) {
        deferred.resolve(false)
        $rootScope.hasUnlockedIdentities = false;
      } else {
        deferred.resolve(true)
        $rootScope.hasUnlockedIdentities = true;
      }
      return deferred.promise;
    };

    $rootScope.hasUnlockedIdentities = false;
    $rootScope.doesHaveUnlockedIdentities();

    $rootScope.unlockIdentity = function unlockIdentity(keys, passphrase){
      keyIsUnlocked(keys)
      .then(function(unlocked){
        if (unlocked) {
          console.log('key already unlocked')
          return;
        } else {
          if (passphrase === undefined) {
            var unlockModal = $modal.open({
              templateUrl: 'app/identities/unlock.html',
              controller: 'unlockController',
              size: 'lg'
            });
            unlockModal.result.then(function(passphrase){
              unlockKey(keys, passphrase);
            });
          } else {
              unlockKey(keys, passphrase);
          }
        }
      })
    };

    $rootScope.lockIdentity = function lockIdentity(index){
      $rootScope.unlockedIdentities.splice(index, 1);
      $rootScope.doesHaveUnlockedIdentities();
    };

    $rootScope.lockAllIdentities = function lockIdentity(index){
      $rootScope.unlockedIdentities = [];
      $rootScope.doesHaveUnlockedIdentities();
    };

    var unlockKey = function(keys, passphrase){
      var key = openpgp.pgp.key.readArmored(keys.privateKeyArmored);
      openpgp.proxy.decryptKey(key.keys[0], passphrase, function(err, unlockedKey){
        if (err) alert(err.message)
        if (unlockedKey) {
          $rootScope.unlockedIdentities.push(unlockedKey);
          $rootScope.doesHaveUnlockedIdentities();
        }
      });
    };

    var keyIsUnlocked = function(key){
      var fingerprint = key.fingerprint;
      var foundFingerprint = false;

      var deferred = $q.defer();

      if ($rootScope.unlockedIdentities[0] === undefined) {
        deferred.resolve(false)
      }
      angular.forEach($rootScope.unlockedIdentities, function(identity, index){
        if (identity.primaryKey.fingerprint === fingerprint) {
          foundFingerprint = true;
        }
        if (index === $rootScope.unlockedIdentities.length-1) {
          deferred.resolve(foundFingerprint)
        }
      })

      return deferred.promise;
    }
}
