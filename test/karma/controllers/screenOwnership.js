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

  var ctrl, scope, $rootScope;
  // inject the $controller and $rootScope services
  // in the beforeEach block
  beforeEach(inject(function($controller, _$rootScope_, $injector) {
    $rootScope = _$rootScope_;
    // Create a new scope that's a child of the $rootScope
    scope = $rootScope.$new();
    // Create the controller
    ctrl = $controller('screenOwnershipController', {
      $scope: scope
    });
  }));

  var screenOwnership;
  var $timeout;
  var $q;
  beforeEach(inject(function($injector, _$timeout_, _$q_) {
    screenOwnership = $injector.get('screenOwnership');
    $timeout = _$timeout_;
    $q = _$q_;
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

  it('should create a screenID', function(done) {

    $httpBackend.whenGET(/.*/).passThrough();
    $httpBackend.whenPOST(/.*/).passThrough();
    console.log($httpBackend)
    console.log($httpBackend.whenGET)
    expect(scope.screenID).toBeUndefined();
    setTimeout(function(){
      expect(scope.screenID).toBeDefined();
      expect(scope.screenKeys).toBeDefined();
      done();
    }, 5000);

    setInterval(function(){
        $rootScope.$digest();
        //httpBackend.flush();
    }, 250);
  });
});
