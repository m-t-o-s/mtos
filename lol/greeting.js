if (Meteor.isClient) {
	Template.playerHUD.greeting = function () {
		if (!Session.get('greeting')) {
			return Template.playerHUD.newGreeting();
		} else {
			return Session.get("greeting");
		}
	}
	Template.playerHUD.newGreeting = function () {
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
				'multiple'
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
		var greeting = "your " +
			getRandomWord(possibilities.m) +
			getRandomWord(possibilities.t) +
			getRandomWord(possibilities.o) +
			getRandomWord(possibilities.s)
		;
		Session.set("greeting", greeting);
		return greeting;
	}
	Template.playerHUD.events({
		'click div' : function () {
			// template data, if any, is available in 'this'
			Template.playerHUD.newGreeting();
		}
	});
}
