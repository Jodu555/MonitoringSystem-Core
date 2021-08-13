const { jsonSuccess, jsonError } = require('../utils/jsonMessages');
const { serverCreationSchema } = require('../database/schemas');
const { v4 } = require('uuid');
const { Database } = require('@jodu555/mysqlapi');
const database = Database.getDatabase();


const get = async (req, res, next) => {
    const uuid = req.params.uuid;

    //Check if user owns this server
    const servers = await database.get('server').get({ unique: true, account_UUID: req.credentials.user.UUID });
    if (servers.filter(server => server.data_UUID == uuid).length > 0) {
        const datas = await database.get('data').get({ unique: true, UUID: uuid });
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