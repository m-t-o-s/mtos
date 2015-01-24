# mtos

**mtos** is a secured feed protocol for publishing and aggregating media for tagging, remixing, and reblogging

# protections against surveillance

* **mt-items** should all be signed to verify authorship and valid
  transmission, even in the case of anonymous authorship (anonymous authorship
merely means signed with a new key not tied to any previously created key)
* **mt-items** may be encrypted so that no **mt-server** can decrypt the
  contents of the **mt-items** stored in it's **mt-cache**
* p2p transmission of **mt-items** is end to end encrypted so that no third
  party can determine who is accessing an **mt-item**
* p2p transmission of **mt-items** is onion routed so no **mt-server** may know
  who is accessing or storing an **mt-item**

(language modeled after [rfc2119](http://tools.ietf.org/html/rfc2119))

# key creation and transmission

Identity management is done using PGP keys, at the moment this is done in
browser using OpenPGP.js, but it should eventually be handled by Cordova
plugins.  Users can generate as many identites as they would like to, and each
identity creates it's own keychain that is stored in local browser storage.  

Identites may be public or private.  Public identites have their public keys
published on the server, and private identities' public keys are only shared
out of band.

**mtos** has a concept of a screen that stores keychains as well as the p2p
datastore.  Keychains may be transferred from one screen to another and the
screens public keys are also transferred out of band, so the server never sees
any of the user data.  Great care will have to be taken to insure that data is
properly anonymized and replicated in a manner that prevents social graph
construction from p2p data.

Out of band key transfer is achieved through nfc, bluetooth, qr-codes, and
manually entering hashes.  the federation of **mt-servers** knows very little
about the screens that operate as the nodes of the p2p network.  The only data
that the server transmits is to notify screens that key transfer requests have
been initialized.  because key transfer is user initiated while a user is in
front of two screens or two users are in front of thier own screens, the server
only needs to monitor the progress through the steps of out of band key
exchange, never knowing any of the encryption keys used during the out of band
key transfer.

Roadmap
=======

It's been a couple of years since I last worked on this project, the previous
work (except for this README) can be found in the `archive` branch.

Since moving off of Meteor and on to AngularJS, the primary work done has been
to provide PGP identity management and out of band key exchange  because these
are unsolved problems in web application design that must be addresed before
building an anonymized p2p network.


Basic Content Types
===================

Supplied by oEmbed and Schema.org definitions
(if that's not near enought to Wordpress/Facebook/Tumblr/Google+ standards,
define a subset for the leviathans).

Implemented Sites
=================


Unimplemented Sites
===================

* Twitter
* tumblr
* facebook
* google+
* youtube
* vimeo
* instagram
* reddit
* wordpress
* tentd
* app.net
* diaspora
* medium
* wikipedia
* etherpad
* drupal

Completed Site Parsers
======================

none

Wanted Site Parsers
===================

* all implemented sites
* oEmbed
* schema.org
* open graph
* RDFa
* bandcamp
* soundcloud
* rdio
* zeega
* popcorn.js
* kaltura
* archive.org
* blip.tv
