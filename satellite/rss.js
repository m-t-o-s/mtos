var opml2object = {

	parse: function(opml) {

		var doc;
		// code for IE
		if (window.ActiveXObject) {
			doc = new ActiveXObject("Microsoft.XMLDOM");
			doc.async = false;
			doc.loadXML(opml);
			// code for Mozilla, Firefox, Opera, etc.
		} else {
			var parser = new DOMParser();
			doc = parser.parseFromString(opml,"text/xml");
		}

		return outlines = doc.getElementsByTagName('outline');
			/*
			for (var i = 0, max = outlines.length; i < max; i++) {

				curr = outlines[i];
				if (!curr.hasChildNodes()) {
					title   = curr.getAttribute('title');
					htmlurl = curr.getAttribute('htmlUrl');
					xmlurl  = curr.getAttribute('xmlUrl');
					html += this.item_template.replace(/{TITLE}/, title).replace(/{HTMLURL}/, htmlurl).replace(/{XMLURL}/, xmlurl);
				}

			}
			var opml_title = doc.getElementsByTagName('title')[0].firstChild.nodeValue;
			html = this.html_template.replace(/{ITEMS}/, html).replace(/{OPMLTITLE}/, opml_title);
			return html;
			*/
	}
}
var importOPML = {
	getOPML: function() {
		$.ajax({
			url:"fever.opml", 
			success: function(data) { console.dir(importOPML.findFeeds(data)) },
			dataType: "xml" 
		});
	},
	findFeeds: function(xml, category) {
		$( xml ).find( "outline" ).each( function(index, element) {
			if ( element.hasChildNodes() ) {
				importOPML.findFeeds( element, element.attributes.getNamedItem("text").value );
			} else {
				var feed = {};
				if (!feed["tags"] && category) {
					feed["tags"] = [ category ];
				} else {
					feed["tags"] = [];
				}
				if (feed["tags"] && category) {
					feed["tags"].push(category);
				}
				$( element.attributes ).each( function(index, element) {
						feed[element.nodeName] = element.nodeValue;
				});
				if (!window.feeds) {
					window.feeds = [];
					window.feeds.push(feed);
				} else {
					var feedMatch = undefined;
					$.each(window.feeds, function(key, val){
						//console.log("Checking: " + feed.xmlUrl, val.xmlUrl);
						if (val.xmlUrl == feed.xmlUrl) {
							console.log("FEED MATCH: " + feed.xmlUrl, val.xmlUrl);
							feedMatch = true;
							return false; // break;
						} else {
							console.log("searching", window.feeds.length );
						}
					});
					if (!feedMatch) {
						console.log( "saving", window.feeds.length + 1 );
						window.feeds.push(feed); // continue; - just to satisfy jsLint
					}
				}
			}
		});
		return window.feeds;
	} 
};
if (Meteor.isClient) {
}
