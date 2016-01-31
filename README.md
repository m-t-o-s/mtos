[![mtos logo](https://cdn.rawgit.com/m-t-o-s/artwork/master/logo.png)](https://github.com/m-t-o-s/mtos)

# mtos

[![Build Status](https://travis-ci.org/m-t-o-s/mtos.svg?branch=master)](https://travis-ci.org/m-t-o-s/mtos)

*[https://github.com/m-t-o-s/mtos](https://github.com/m-t-o-s/mtos)*

***This project is at version v0.0.0***

***please do not use it***

**mtos** is public key encrypted messaging and [webtorrent](https://webtorrent.io) data dead drops for social messaging and collaboration built on [hyperlog](https://github.com/mafintosh/hyperlog) backed [scuttlebutt](https://github.com/ssbc/secure-scuttlebutt) messaging via the [friends-swarm](https://github.com/moose-team/friends-swarm) p2p messaging library.

Message contents are encrypted via GPG keys generated by [Forge](https://github.com/digitalbazaar/forge), which is also used to perform all PKI functions for encryption, decryption, signing, and verification.  After signing and encryption, data is buffered with webtorrent and seeded for message recipients.  When a torrent is ready to be downloaded by peers, message recipients are notified that there is content ready for them to download.

The message notification ifrastructure is p2p WebRTC datachannels established through a publicly accessible [signalhub](https://github.com/mafintosh/signalhub), and webtorrent tracking and peer discovery is provided by [bittorrent-tracker](https://github.com/feross/bittorrent-tracker).

# Current Security Failures

1. A network graph may be constructed of who talks to whom by analyzing either the peers of the torrent swarms or the WebRTC messaging patterns.
1. Neither the keychain storage nor the torrent data storage is encrypted.

# Development

    npm install -g standard tape nodemon jsdoc
    npm install
    npm test
    npm run docs
    npm run dev
