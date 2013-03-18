TwitterFavorites = new Meteor.Collection("twitter_favorites");

if ( Meteor.isClient ) {
	var TwitterFavorite = Backbone.Model.extend({
		defaults: {
			userId: Meteor.userId(),
			saved: false
		},
		save: function() {
			if ( !this.attributes.tweetId ) {
				this.attributes.tweetId = TwitterFavorites.insert(this.attributes);
			} else {
				TwitterFavorites.update(this.attributes.tweetId, this.attributes);
			}
			this.attributes.saved = true;
			return this.attributes.tweetId;
		},
		saved: function() {
				return this.attributes.saved;
		},
		modified: function() {
			this.attributes.saved = false;
		},
		data: function() {
			return this.attributes.tweet_data;
		}
	});
}



if (Meteor.isServer) {
	var twitter = new Twitter();
	Meteor.startup(function () {
		// code to run on server at startup
	});
	Meteor.methods({
		getTwitterFavorites: function () {
			_.each(twitter.favoritesList().data, function(element) {
				new TwitterFavorite(element).save();
				console.log("saved " + element);
			});
		}
	});
	var TwitterFavorite = Backbone.Model.extend({
		defaults: {
			saved: false
		},
		save: function() {
			if ( !this.attributes.tweetId ) {
				this.attributes.tweetId = TwitterFavorites.insert(this.attributes);
			} else {
				TwitterFavorites.update(this.attributes.tweetId, this.attributes);
			}
			this.attributes.saved = true;
			return this.attributes.tweetId;
		},
		saved: function() {
				return this.attributes.saved;
		},
		modified: function() {
			this.attributes.saved = false;
		},
		data: function() {
			return this.attributes.tweet_data;
		}
	});
}
