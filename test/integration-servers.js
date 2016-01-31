'use strict'

var TorrentTracker = require('bittorrent-tracker').Server
var signalhubServer = require('../node_modules/signalhub/server')
var signalhub = require('signalhub')

var tracker = new TorrentTracker({
  http: true,
  udp: true,
  ws: true
})
tracker.listen(0)

function waitForTracker (event) {
  return new Promise(function (resolve) {
    tracker.on(event, resolve)
  })
}

var hub

var waitForSignalhub = new Promise(function (resolve, reject) {
  hub = signalhubServer().listen(0, function () {
    resolve()
  })
})

var serversAreRunning = Promise.all([
  waitForTracker('listening'),
  waitForSignalhub
])

var optionsReturner = serversAreRunning
.then(function () {
  var defaultOptions = {
    hubs: [
      'http://localhost:' + hub.address().port
    ],
    trackers: [
      'ws://localhost:' + tracker.ws.address().port,
      'udp://localhost:' + tracker.ws.address().port,
      'http://localhost:' + tracker.ws.address().port
    ]
  }
  var client = signalhub('mtos', defaultOptions.hubs[0])
  console.log(client)
  client.subscribe('aliceandbob').on('data', console.log)
  console.log(defaultOptions)
  return Promise.resolve({
    hub: hub,
    tracker: tracker,
    defaultOptions: defaultOptions
  })
})

module.exports = optionsReturner
