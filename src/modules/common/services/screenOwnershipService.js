'use strict';

module.exports = /*@ngInject*/
  function screenOwnershipService(openpgp, $localForage, uuid4, $q, $http, serverEnvironment, $timeout) {

    var loadScreenKeys = function loadScreenKeys(screenID) {
      var deferred = $q.defer();
      $localForage.getItem('screenKeys')
      .then(function(screenKeys){
        if (screenKeys===null) {
          console.log('generating screenKeys');
          generateScreenKeys(screenID)
          .then(function(keys){
            delete keys.key
            $localForage.setItem('screenKeys', keys)
            .then(function(screenKeys){
              deferred.resolve(screenKeys);
            });
          });
        } else {
          deferred.resolve(screenKeys);
        }
      });
      return deferred.promise;
    }

    var generateScreenKeys = function generateScreenKeys(screenID){
      var deferred = $q.defer();
      openpgp.proxy.generateKeyPair({
        numBits: 1024,
        userId: screenID,
        passphrase: screenID
      }, function(err,key){
        console.log('screenKeys generated')
        deferred.resolve(key)
      })
      return deferred.promise;
    };

    var getScreenKeys = function getScreenKeys(screenID){
      var deferred = $q.defer();
      loadScreenKeys(screenID)
      .then(function(screenKeys){
        deferred.resolve(screenKeys);
      });
      return deferred.promise;
    };

    var getScreenID = function getScreenID(){
      var deferred = $q.defer();

      $localForage.getItem('screenID')
      .then(function(screenID){
        if (screenID===null) {
          $localForage.setItem('screenID', uuid4.generate())
          .then(function(screenID){
            deferred.resolve(screenID);
          });
        } else {
          deferred.resolve(screenID);
        }
      });
      return deferred.promise;
    };

    var genAuthKeys = function genAuthKeys(screenID) {
      return generateScreenKeys(screenID);
    };

    var registerAuthKeys = function registerAuthKeys(publicKey) {

      return $http.post('/register-screen', {register: publicKey})
      .then(function(res){
        var deferred = $q.defer();
        console.log(res);
        deferred.resolve(res)
        return deferred.promise;
      })

    };

    var decryptNonce = function decryptNonce(nonce, keys){
      var deferred = $q.defer();
      console.log('nonce decrypt keys', keys.key.users[0].userId.userid);
      var privateKey = openpgp.pgp.key.readArmored(keys.privateKeyArmored).keys[0];
      privateKey.decrypt(keys.key.users[0].userId.userid)
      var nonceDecoded = openpgp.pgp.message.readArmored(nonce);
      openpgp.proxy.decryptMessage(privateKey, nonceDecoded, function(err, message){
        console.log('decryp: ', message)
        deferred.resolve(message)
      });
      return deferred.promise;
      //openpgp.proxy.
    };

    var canRTC = false;

    var listenTimeout = undefined;

    var listenForConnectionRTC = function listenForConnectionRTC(screenID) {
    };

    var listenForConnectionLP = function listenForConnectionLP(screenID) {
      console.log('long polling for screen ownership request')

      var deferred = $q.defer();

      $http.post('/screen', {awaitingConnection:screenID})
      .then(function(res){
        deferred.resolve(res.data);
        console.log('Received', res.data)
        if (!res.data[requestFrom]) listenTimeout = $timeout(requestScreen(screenId,thisScreenID), 30*1000)
      });

      return deferred.promise;

    };

    var listenForConnection = function listenForConnection(screenID) {
      if (canRTC) return listenForConnectionRTC(screenID);
      else return listenForConnectionLP(screenID);
    }

    var requestScreen = function requestScreen(screenID, thisScreenID) {
      var deferred = $q.defer();
      $http.post('http://'+serverEnvironment.domainString+'/screen', {requestingScreen:screenID, requestFrom: thisScreenID})
      .then(function(res){
        deferred.resolve(res.data);
        console.log('Received', res.data)
      });
      return deferred.promise;
    };

    return {
      getScreenID: getScreenID,
      getScreenKeys: getScreenKeys,
      connection: listenForConnection,
      requestScreen: requestScreen,
      genAuthKeys: genAuthKeys,
      registerAuthKeys: registerAuthKeys,
      decryptNonce: decryptNonce
    };
  };
