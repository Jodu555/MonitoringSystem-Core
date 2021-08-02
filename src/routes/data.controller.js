const { jsonSuccess, jsonError } = require('../utils/jsonMessages');
const { serverCreationSchema } = require('../database/schemas');
const { v4 } = require('uuid');

let database;
const setDatabase = (_database) => {
    database = _database;
};


const get = async (req, res, next) => {
    const uuid = req.params.uuid;

    //Check if user owns this server
    const servers = await database.getServer.get({ unique: true, account_UUID: req.credentials.user.UUID });
    if (servers.filter(server => server.data_UUID == uuid).length > 0) {
        const datas = await database.getData.get({ unique: true, UUID: uuid });
        const response = jsonSuccess('Success');
        response.data = datas;
        res.json(response);
    } else {
        res.json(jsonError('You dont own this server'));
    }


}

module.exports = {
    setDatabase,
    get,
}