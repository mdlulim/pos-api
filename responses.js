// responses.js

const response = {

	// success messages
	messages: [{
		status  : 201,
		source  : {},
		error   : false,
		title   : "success",
		message : "request successfully processed."
	}],

	// errors
	errors: [{
		status  : 101,
		source  : {},
		error   : false,
		title   : "Unkown Error",
		message : "An unexpected error has occurred, please try again later."
	},{
		status  : 102,
		source  : {},
		error   : false,
		title   : "Invalid Company",
		message : "Invalid company identifier provided."
	},{
		status  : 404,
		source  : {},
		error   : false,
		title   : "Error 404",
		message : "The request your're trying to access was not found."
	}],
	writeError: function(code, obj) {
		var errors = this.errors;
		obj = obj || 0;
		for (var i=0; i<errors.length; i++) {
			if (errors[i].status == code) {
				var returnObj = messages[i];
				if (typeof obj === 'object') {
					returnObj = Object.assign(messages[i], obj);
				}
				return returnObj;
			}
		}
		return false;
	},
	writeMessage: function(code, obj) {
		var messages = this.messages;
		obj = obj || 0;
		for (var i=0; i<messages.length; i++) {
			if (messages[i].status == code) {
				var returnObj = messages[i];
				if (typeof obj === 'object') {
					returnObj = Object.assign(messages[i], obj);
				}
				return returnObj;
			}
		}
		return false;
	}
}

module.exports = response;