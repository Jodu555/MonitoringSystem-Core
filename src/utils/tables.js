const { Database } = require('@jodu555/mysqlapi');
const database = Database.getDatabase();

function createTables() {

    database.createTable('accounts', {
        options: {
            K: ['UUID'],
            PK: 'UUID',
        },
        UUID: 'varchar(64)',
        username: 'TEXT',
        email: 'TEXT',
        password: 'TEXT',
        verified: 'TINYTEXT',
        verificationToken: 'MEDIUMTEXT',
    });

    database.createTable('server', {
        options: {
            K: ['account_UUID', 'data_UUID'],
            PK: 'UUID',
        },
        UUID: 'varchar(64)',
        account_UUID: 'varchar(64)',
        name: 'TEXT',
        authorization_key: 'TEXT',
        data_UUID: 'varchar(64)',
    });

}

module.exports = { createTables };