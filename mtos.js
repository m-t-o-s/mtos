// Media Timeline Operational Syndicator
if (Meteor.isClient) {
	Template.welcome.greeting = function () {
		var possibilities = {
			m: [ 
				'media', 
				'multilateral',
				'multiplexed',
				'multiplexing',
				'multicasting',
				'messaging',
				'massaging',
				'moving',
				'meaty',
				'moribund',
				'massive'
			],
			t: [
				'timeline',
				'translation',
				'ticking',
				'tagging',
				'tool',
				'tweaking',
				'tidal',
				'turing'
			],
			o: [
				'operational',
				'operations',
				'overview',
				'objectified',
				'object',
				'organizer',
				'organized'
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
				'simaculara'
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
