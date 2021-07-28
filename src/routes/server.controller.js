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

const create = async (req, res, next) => {

    const validation = serverCreationSchema.validate(req.body);
    if (validation.error) {
        res.json(jsonError(validation.error.details[0].message));
    } else {
        const server = validation.value;

        //Prepare server object
        server.account_UUID = req.credentials.user.UUID;
        server.UUID = v4();
        server.data_UUID = v4();
        server.authorization_key = generateVerificationToken(5);

        //Check if server with name exists
        const servers = await database.getServer.get({ unique: true, account_UUID: req.credentials.user.UUID, name: server.name });
        if (servers.length == 0) {
            await database.getServer.create(server);
            const response = jsonSuccess('Success');
            response.data = server;
            res.json(response);
        } else {
            res.json(jsonError('Server with that name already exists!'));
        }
    }
}

function generateVerificationToken(len) {
    let token = '';
    for (let i = 0; i < len; i++) {
        token += v4();
    }
    token = token.split('-').join('');
    return token;
};

module.exports = {
    setDatabase,
    getAll,
    get,
    create,
}