'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var expressApp = express();
var server = require('http').Server(expressApp);
var argv = require('yargs').argv;
var lr = require('connect-livereload');

global.release = argv.release;

require('../gulp/config');

var staticServerPath = BUILD_FOLDER;
if (release) staticServerPath = RELEASE_FOLDER;

// simple logger
expressApp.use(function(req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});

expressApp.disable('x-powered-by');

expressApp.use(express.static(staticServerPath));

expressApp.use(lr());

expressApp.use(bodyParser.json());


var crypto = require('crypto');
var passport = require('passport');
var PublicKeyStrategy = require('passport-publickey').Strategy;

passport.use(new PublicKeyStrategy(
  function(nonce, signature, done) {
    authorizedScreens.findByNonce(nonce, function (err, screen) {
      if (err) { return done(err); }
      if (!screen) { console.log('screen not authorized'); return done(null, false); }

      var verifier = crypto.createVerify("RSA-SHA256");
      verifier.update(nonceString);

      var publicKeyBuf = new Buffer(screen.public_key, 'base64');

      var result = verifier.verify(publicKeyBuf, signature, "base64");

      if (result) {
        return done(null, screen);
      } else {
        return done(null, false);
      }
    });
  }
));

expressApp.use(passport.initialize());

var screens = {};
var pausedRequests = {};
var messages = {};

var requestTimeout = 30; //seconds

var openpgp = require('openpgp');

var authorizedScreens = {};
expressApp.post('/register-screen', function(req, res){
  req.connection.on('close', function(){
    console.log('SERVED', req.body);
  });

  if (!req.body.register) res.status(400).send(null);
  else {
    var publicKey = openpgp.key.readArmored(req.body.register);
    var nonce =  crypto.randomBytes(64).toString('base64');
    console.log('NONCE CREATE:', nonce);
    authorizedScreens[nonce] = {publicKey: req.body.register};
    res.send(JSON.stringify({nonce:openpgp.encryptMessage(publicKey.keys, nonce)}));
  }
})

expressApp.post('/screen', passport.authenticate('publickey', { session:false}), function(req, res){



  req.connection.on('close', function(){
    console.log('SERVED', req.body);
  })

  function pauseRequest(screenID, req, res) {
    if (!pausedRequests[screenID]) pausedRequests[screenID] = [];

    var request = {
      screenID: screenID,
      req: req,
      res: res
    }

    pausedRequests[screenID].push(request);

    req.connection.setTimeout(requestTimeout*1000);
    req.connection.on('timeout', function(){
      request.req = null;
      request.res = null;
      console.log('TIMEOUT '+screenID)
    });

    //req.pause();
    console.log('PAUSE '+screenID)
  }

  function notifyScreen(screenID){
    if (!pausedRequests[screenID]) return;

    messages = screens[screenID].messages;
    if (!messages) return;

    console.log('PAUSED REQUESTS: '+pausedRequests[screenID][0]);

    var request = pausedRequests[screenID][0];

    request.res.send(messages)
    request.res.end()
    pausedRequests[screenID].length = 0;
    screens[screenID].messages.length = 0;

  }

  if (!req.body) {
    res.status(400).send(null);
    return;
  } else if (!req.body.screenID || !req.body.message || !req.body.type || !req.body.targetID){
    res.status(400).send(null);
    return;
  } else {
  }

  var screenID = req.body.screenID;
  var targetID = req.body.targetID;
  var message = req.body.message;
  var type = req.body.type;

  function requestScreen(targetScreen, requestFrom){
    console.log('SCREEN '+targetScreen+' REQUESTED FROM '+requestFrom);

    if (!screens[targetScreen]) return;

    screens[targetScreen].messages.push({screenRequest:requestFrom});
    console.log('NEW MESSAGES'+screens[targetScreen].messages)
    notifyScreen(targetScreen);
  }

  function screenAvailable(screenID){
    console.log('SCREEN AVAILABLE: '+screenID);

    if (!screens[screenID]) {
      screens[screenID] = {messages:[]}
    }

    var messages = screens[screenID].messages;

    if (messages.length === 0) {
      pauseRequest(screenID, res, res);
    } else {
      res.send(JSON.stringify(messages));
      res.end();
    }
  }

  function removeScreen(screenID){
    console.log('SCREEN UNAVAILABLE: '+screenID);
  }

  function sendData(targetID, fromID, message){
    console.log('SENDING '+message+' TO '+targetID+' from '+fromID);
  }

  function waitForData(screenID){
    console.log('WAITING FOR DATA: '+screenID);

    // close pending requests
    if (pausedRequests[screenID])
      if (pausedRequests[screenID].length != 0) {
        pausedRequests[screenID][0].res.end();
        pausedRequests[screenID].length = 0;
      }

    if (!screens[screenID]) {
      screens[screenID] = {messages:[]}
    }

    var messages = screens[screenID].messages;

    if (messages.length === 0) {
      pauseRequest(screenID, res, res);
    } else {
      console.log('SENDING DATA TO '+screenID+': '+messages)
      res.send(JSON.stringify(messages));
      res.end();
    }

    switch (type) {
      case 'SEND DATA':
        sendData(targetID, screenID, message);
        break;
      case 'REQUEST SCREEN':
        requestScreen(targetID, screenID)
        break;
      case 'SCREEN AVAILABLE':
        screenAvailable(screenID);
        break;
      case 'SCREEN UNAVAILABLE':
        removeScreen(screenID);
        break;
      default:
        waitForData(screenID);
        return;
    }
  }

  waitForData(screenID, type, message, targetID);

});
// create the switchboard
var switchboard = require('rtc-switchboard')(server);

// we need to expose the primus library
expressApp.get('/rtc.io/primus.js', switchboard.library());

server.listen(process.env.PORT || config.ports.staticServer);

console.log('server listening')
