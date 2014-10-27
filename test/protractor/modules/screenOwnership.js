// spec.js
describe('screen ownership is the first thing that loads', function() {

  it('and should have a user interface', function() {
    browser.get('http://192.168.1.151:8080/');

    expect(element(by.id('add-identities')).isPresent()).toBe(true);
    expect(element(by.id('scan-barcode')).isPresent()).toBe(true);
    expect(element(by.id('qr-code')).isPresent()).toBe(true);
  });

});
