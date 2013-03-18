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
			success: function(data) { importOPML.findFeeds(data) },
			dataType: "xml" 
		});
	},
	findFeeds: function(xml) {
		$( xml ).find( "outline" ).each( function(index, element) {
			if ( element.hasChildNodes() ) {
				console.log( "CATEGORY: " + element.attributes.getNamedItem("text").value )
				importOPML.findFeeds( element );
			} else {
				console.log('feed: ' + element.attributes.getNamedItem("text").value );
				$( element ).each( function(index, element) {
					if ( element.attributes.getNamedItem("type").value === "rss" ) {
						console.log( element.attributes.getNamedItem("xmlUrl").value ); 
					}
				});
			}
		});
	} 
}
