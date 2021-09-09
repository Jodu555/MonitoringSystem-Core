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

}

module.exports = { createTables };