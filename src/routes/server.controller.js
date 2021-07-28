const { jsonSuccess, jsonError } = require('../utils/jsonMessages');
const { serverCreationSchema } = require('../database/schemas');
const { v4 } = require('uuid');

let database;
const setDatabase = (_database) => {
    database = _database;
};

const getAll = async (req, res, next) => {
    const servers = await database.getServer.get({ account_UUID: req.credentials.user.UUID, });
    const response = jsonSuccess('Success');
    response.data = servers;
    res.json(response);
};


const get = async (req, res, next) => {
    const uuid = req.params.uuid;
    const servers = await database.getServer.get({ unique: true, account_UUID: req.credentials.user.UUID, UUID: uuid });
    const response = jsonSuccess('Success');
    response.data = servers;
    res.json(response);
}

module.exports = {
    setDatabase,
    getAll,
    get,
}