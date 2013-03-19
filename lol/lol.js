Lols = new Meteor.Collection("lols");

if (Meteor.isClient) {
	Template.lol.lol = function () {
		currentLol = 
			Lols.findOne(
				{ "userId": Meteor.userId()}, 
				{ sort: { timestamp: -1 } } 
			);
		if (!currentLol) {
			if (!Session.get('greeting')) {
				return Template.lol.newLol();
			} else {
				return Session.get("lol");
			}
		} else {
			return currentLol.lol;
		}
	}
	Template.lol.newLol = function () {
		var possibilities = {
			m: [ 
				'media', 
				'multilateral',
				'multiplex',
				'multicast',
				'massive',
				'mostly',
				'morphing',
				'multipass',
				'multi-use',
				'multiple',
				'meta'
			],
			t: [
				'timeline',
				'time',
				'translation',
				'tagging',
				'tweaking',
				'tidal',
				'tickling',
				'turning',
				'teathered',
				'tiny'
			],
			o: [
				'operation',
				'overhead',
				'object',
				'operatic'
			],
			s: [
				'syndicator',
				'surface',
				'slicer',
				'saver',
				'server',
				'silo',
				'submarine',
				'subculture',
				'sensation',
				'simacularum',
				'simaculara',
				'singularity',
				'signage',
				'semiotics',
				'seaside',
				'suit',
				'suitcase',
				'synth',
				'synthesizer',
				'spider'
			]
		};
		function getRandomWord (letter) {
			return letter[ Math.floor(Math.random() * (letter.length)) ] + " ";
		}
		var lol = "your " +
			getRandomWord(possibilities.m) +
			getRandomWord(possibilities.t) +
			getRandomWord(possibilities.o) +
			getRandomWord(possibilities.s)
		;
		Lols.insert({ "userId": Meteor.userId(), "lol": lol, "timestamp": (new Date()).getTime() })
	}
	Template.lol.events({
		'click div' : function () {
			// template data, if any, is available in 'this'
			Template.lol.newLol();
		}
	});
	
	Template.lol.helpers({
	});
	
	Template.lol.events({
	});
}
