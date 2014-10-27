'use strict';

describe('Unit: ScreenOwnership', function() {
  // Load the module with MainController
  beforeEach(module('mtos'));

  var $httpBackend;
  beforeEach(function(){
    //instantiate your modules
    angular.mock.module('ngMockE2E', 'mtos')

    angular.mock.module(function ($provide) {

      //retrieve the $httpBackend from module ng and override $delegate from ngMockE2E
      angular.injector(['ng'])
      .invoke(function($httpBackend) {
        $provide.value('$delegate', $httpBackend);
      });

      //retrieve the $httpBackend from module ng and override $delegate from ngMockE2E
      angular.injector(['ngMockE2E'])
      .invoke(['$httpBackend', function(_$httpBackend_){
        $httpBackend = _$httpBackend_;
      }]);

      $provide.value('$httpBackend', $httpBackend);
    })
  });

  var screenOwnershipService;
  beforeEach(inject(function($injector) {
    screenOwnershipService = $injector.get('screenOwnership');
    $httpBackend.whenGET(/.*/).passThrough();
    $httpBackend.whenPOST(/.*/).passThrough();
  }));

  var $timeout;
  var $q;
  var $rootScope
  beforeEach(inject(function($injector, _$timeout_, _$q_, _$rootScope_) {
    $timeout = _$timeout_;
    $q = _$q_;
    $rootScope = _$rootScope_;
  }));

  var originalTimeout;
  beforeEach(function() {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
  });
  afterEach(function(done) {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    localforage.clear(done);
  });

  var screenID;
  it('should create a screenID', function(done) {
    expect(screenID).toBeUndefined();

    screenOwnershipService.getScreenID().then(function(ID){
      screenID = ID;
      expect(screenID).toBeDefined();
      done();
    });

    setInterval(function(){
      $rootScope.$digest();
    }, 250);

  });

  var screenKeys;
  it('should create screenKeys', function(done) {
    expect(screenID).toBeDefined();
    expect(screenKeys).toBeUndefined();

    screenOwnershipService.getScreenKeys(screenID)
    .then(function(keys){
      screenKeys = keys;
      expect(screenKeys).toBeDefined();
    })
    .finally(done);

    setInterval(function(){
      $rootScope.$digest();
    }, 250);

  });

  var screenAuthKeys;
  it('should create screenAuthKeys', function(done) {
    expect(screenID).toBeDefined();
    expect(screenKeys).toBeDefined();

    screenOwnershipService.genAuthKeys(screenID)
    .then(function(keys){
      screenAuthKeys = keys;
      expect(screenAuthKeys).toBeDefined();
    })
    .finally(done);

    setInterval(function(){
      $rootScope.$digest();
    }, 250);

  });

  var screenA;
  it('should authenticate with the server', function(done) {
    expect(screenID).toBeDefined();
    expect(screenKeys).toBeDefined();
    expect(screenAuthKeys).toBeDefined();

    screenA = {
      ID: screenID,
      keys: screenKeys,
      authKeys: screenAuthKeys
    };

    screenOwnershipService.registerAuthKeys(screenA.authKeys.publicKeyArmored)
    .then(function(response){
      expect(response.data.nonce.slice(0,27)).toEqual('-----BEGIN PGP MESSAGE-----');
      screenOwnershipService.decryptNonce(response.data.nonce, screenA.authKeys)
      .then(function(nonce){
        dump('decrypted nonce: '+nonce);
        expect(nonce).toBeDefined();
        done();
      })
    })

    setInterval(function(){
      $rootScope.$digest();
    }, 250);

  });
});
