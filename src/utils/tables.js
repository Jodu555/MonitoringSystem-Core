const { Database } = require('@jodu555/mysqlapi');
const database = Database.getDatabase();

function createTables() {
    console.log('Table Creation');

}

module.exports = { createTables };