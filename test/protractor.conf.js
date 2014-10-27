exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['./protractor/**/*.js']
  /*
  multiCapabilities: [{
    browserName: 'firefox'
  }, {
    browserName: 'chrome'
  }]
  */
};
