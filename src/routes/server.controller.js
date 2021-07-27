const { jsonSuccess, jsonError } = require('../utils/jsonMessages');
const { serverCreationSchema } = require('../database/schemas');
const { v4 } = require('uuid');

let database;
const setDatabase = (_database) => {
    database = _database;
};

const getAll = async (req, res, next) => {
    const userUUID = req.credentials.user.UUID;
    database.getServer.get({ unique: true, });
    res.json(jsonSuccess('Test'));
};

module.exports = {
    setDatabase,
    getAll,
}