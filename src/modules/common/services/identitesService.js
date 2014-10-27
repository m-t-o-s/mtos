'use strict';

module.exports = /*@ngInject*/
  function identitesService($q, openpgp) {
    var generateKeys = function generateKeys(userid, passphrase){
      console.log('generating keys for '+ userid)
      var deferred = $q.defer();
      openpgp.proxy.generateKeyPair({
        numBits: 2048,
        userId: userid,
        passphrase: passphrase
      }, function(err,key){
        //console.log(key)
        console.log('keys generated for '+userid)
        key.fingerprint = key.key.primaryKey.fingerprint;
        delete key.key;
        key.userid = userid;
        deferred.resolve(key);
      })
      return deferred.promise;
    };

    return {
      generateKeys: generateKeys
    };
  };
