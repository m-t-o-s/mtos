// spec.js
describe('mtos home page loads', function() {

  it('and should have a title', function() {
    browser.get('http://192.168.1.151:8080/');

    expect(browser.getTitle()).toEqual('MTOS');
  });

  it('and should have a user interface', function() {
    browser.get('http://192.168.1.151:8080/');

    expect(element(by.id('add-identities')).isPresent()).toBe(true);
    expect(element(by.id('scan-barcode')).isPresent()).toBe(true);
    expect(element(by.id('qr-code')).isPresent()).toBe(true);
  });

});
