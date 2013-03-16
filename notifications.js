var Posts = new Meteor.Collection('notifications');

if (Meteor.isClient) {
	Template.notifications.helpers({
		posts: function() {
			return Notifications.find();
		}
	})
}

