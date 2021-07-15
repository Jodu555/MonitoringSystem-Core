const mysql = require('mysql');
const thingDatabase = require('./thingDatabase')
class Database {
	connection = null;

	constructor() { }

	connect() {
		this.connection = mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_DATABASE,
		});
		this.connection.connect();
		this.connection.on('error', (error) => {
			console.log('Database error', error);
			if (error.code === 'PROTOCOL_CONNECTION_LOST') {
				console.log('Database connection Failed!');
				console.log('Attempting to reconnect...');
				this.reconnect();
			} else {
				throw error;
			}
		});

		//Setup all databases here (auth, server, log, data)
		this.authDatabase = new thingDatabase('accounts', 'Auth', this, this.connection);
		this.serverDatabase = new thingDatabase('server', 'Server', this, this.connection);
		this.dataDatabase = new thingDatabase('data', 'Data', this, this.connection);
		this.logDatabase = new thingDatabase('log', 'Log', this, this.connection);
	}

	disconnect() {
		if (this.connection != null) {
			this.connection.end();
			this.connection = null;
		}
	}

	reconnect() {
		this.disconnect();
		this.connect();
	}

	get getAuth() {
		return this.authDatabase;
	}

	get getServer() {
		return this.serverDatabase;
	}

	get getData() {
		return this.dataDatabase;
	}

	get getLog() {
		return this.logDatabase;
	}
}

module.exports = Database;
