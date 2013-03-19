Meteor.absoluteUrl({rootUrl:"http://mtos.co"});

Accounts.config({
	sendVerificationEmail: true,
	forbidClientAccountCreation: false
});

// Media Timeline Operational Syndicator
if (Meteor.isClient) {

	Accounts.ui.config({
		passwordSignupFields: "USERNAME_AND_EMAIL"
	});
}

if (Meteor.isServer) {
	Meteor.startup(function () {
		console.log("Server started on " + Date());
		// code to run on server at startup
	});
}
