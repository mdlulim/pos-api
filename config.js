// config.js

const config = {
	host : process.env.HOST || 'localhost',
	port : process.env.PORT || 8000,
	key  : 'BbZJjyoXAdr8BUZuiKKARWimKfrSmQ6fv8kZ7OFfc',
	database : {
		host   : 'localhost',
		user   : 'root',
		pass   : '',
		name   : 'ekznwildlife',
		prefix : 'pos_'
	},
	auth : {
		algorithm : [ 'HS256' ],  // only allow HS256 algorithm 
		accounts : {
			default : {
				id   : 1,
				user : 'super'
			}
		}
	},
	statuses : {
		transaction : {
			pending   : 1,
			complete  : 3,
			cancelled : 2
		}
	}
}

module.exports = config;
