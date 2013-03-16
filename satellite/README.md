mtos: Satellite
===============

The **mtos Satellite** is a webcrawler that follows
links found in parsed items to see if there are additional items that
we'd like to learn about.  If necessary, the Satellite can fire up a
PhantomJS probe and access publicly available content.

Satellite comms are slow, we just wait around till they sync.
