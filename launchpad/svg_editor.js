Drawings = new Meteor.Collection("drawings");

if (Meteor.isClient) {
	var Drawing = Backbone.Model.extend({
		defaults: {
			svg_data: "\x3C?xml version=\"1.0\"?\x3E\n\x3C!DOCTYPE svg PUBLIC \"-\x2F\x2FW3C\x2F\x2FDTD SVG 1.1\x2F\x2FEN\"\n  \"http:\x2F\x2Fwww.w3.org\x2FGraphics\x2FSVG\x2F1.1\x2FDTD\x2Fsvg11.dtd\"\x3E\n \n\x3Csvg xmlns=\"http:\x2F\x2Fwww.w3.org\x2F2000\x2Fsvg\" version=\"1.1\"\n      width=\"120\" height=\"120\" viewBox=\"0 0 236 120\"\x3E\n  \x3Crect x=\"14\" y=\"23\" width=\"250\" height=\"50\" fill=\"green\"\n      stroke=\"black\" stroke-width=\"1\" \x2F\x3E\n\x3C\x2Fsvg\x3E",
			userId: Meteor.userId(),
			saved: false
		},
		save: function() {
			if ( !this.attributes.drawingId ) {
				this.attributes.drawingId = Drawings.insert(this.attributes);
			} else {
				Drawings.update(this.attributes.drawingId, this.attributes);
			}
			this.attributes.saved = true;
			return this.attributes.drawingId;
		},
		saved: function() {
				return this.attributes.saved;
		},
		modified: function() {
			this.attributes.saved = false;
		},
		data: function() {
			return this.attributes.svg_data;
		}
	});
}
