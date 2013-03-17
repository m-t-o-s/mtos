// Media Timeline Operational Syndicator
if (Meteor.isClient) {
	Template.playerHUD.helpers({
	});
  Template.playerHUD.events({
  });
}

if (Meteor.isServer) {
	Meteor.startup(function () {
		console.log("Server Running");
		// code to run on server at startup
	});
}
