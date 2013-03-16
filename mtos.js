// Media Timeline Operational Syndicator
if (Meteor.isClient) {
	Template.welcome.greeting = function () {
		var possibilities = {
			m: [ 
				'media', 
				'multilateral',
				'multiplex',
				'multicast',
				'messaging',
				'massaging',
				'movement',
				'meat',
				'moribund',
				'massive',
				'most',
				'mostly'
			],
			t: [
				'timeline',
				'translation',
				'ticking',
				'tagging',
				'tool',
				'tweaking',
				'tidal',
				'turing',
				'tooth',
				'travesty'
			],
			o: [
				'operational',
				'operations',
				'overhead',
				'objectified',
				'object',
				'organizer',
				'organized',
				'obectivist',
				'orthagonal',
				'ornithilogical',
				'ontological',
				'operatic',
				'over'
			],
			s: [
				'syndicator',
				'surface',
				'slicer',
				'saver',
				'silo',
				'subculture',
				'sensation',
				'suck',
				'simacularum',
				'simaculara',
				'singularity',
				'signage',
				'semiotics',
				'seaside'
			]
		};
		function getRandomWord (letter) {
			return letter[ Math.floor(Math.random() * (letter.length)) ] + " ";
		}
		return "the " +
			getRandomWord(possibilities.m) +
			getRandomWord(possibilities.t) +
			getRandomWord(possibilities.o) +
			getRandomWord(possibilities.s)
		;
	};

  Template.welcome.events({
    'click input' : function () {
      // template data, if any, is available in 'this'
      //if (typeof console !== 'undefined')
      //  Template.welcome.greeting();
		//Template.welcome
    }
  });
}

if (Meteor.isServer) {
	Meteor.startup(function () {
		console.log("Server Running");
		// code to run on server at startup
	});
}
