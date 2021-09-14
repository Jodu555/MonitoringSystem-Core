const { jsonSuccess, jsonError } = require('../../utils/jsonMessages');
const { serverCreationSchema } = require('../../database/schemas');
const { v4 } = require('uuid');
const { Database } = require('@jodu555/mysqlapi');
const database = Database.getDatabase();


const getAll = async (req, res, next) => {
    const servers = await database.get('server').get({ account_UUID: req.credentials.user.UUID, });
    const response = jsonSuccess('Success');
    response.data = servers;
    res.json(response);
};


const get = async (req, res, next) => {
    const uuid = req.params.uuid;
    const servers = await database.get('server').get({ unique: true, account_UUID: req.credentials.user.UUID, UUID: uuid });
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
        const servers = await database.get('server').get({ unique: true, account_UUID: req.credentials.user.UUID, name: server.name });
        if (servers.length == 0) {
            await database.get('server').create(server);
            const response = jsonSuccess('Success');
            response.data = server;
            res.json(response);
        } else {
            res.json(jsonError('Server with that name already exists!'));
        }
    }
}

const patch = async (req, res, next) => {
    const uuid = req.params.uuid;
    const validation = serverCreationSchema.validate(req.body);
    if (validation.error) {
        res.json(jsonError(validation.error.details[0].message));
    } else {
        const server = validation.value;
        const servers = await database.get('server').get({ unique: true, account_UUID: req.credentials.user.UUID, uuid });
        if (servers.length > 0) {
            const updated = await database.get('server').update({ unique: true, UUID: uuid, account_UUID: req.credentials.user.UUID }, { name: server.name });
            const response = jsonSuccess('Success');
            response.data = updated;
            res.json(response);
        } else {
            res.json(jsonError('Server with that uuid doesnt exists!'));
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
    getAll,
    get,
    create,
    patch,
}