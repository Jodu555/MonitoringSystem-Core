const { jsonSuccess, jsonError } = require('../utils/jsonMessages');
const { userRegisterSchema, userLoginSchema } = require('../database/schemas');
const { sendVerificationMessage } = require('../utils/mailer')
const { v4 } = require('uuid');

let database;
const setDatabase = (_database) => {
    database = _database;
};



module.exports = {
    setDatabase,

}