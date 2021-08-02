const express = require('express');
const controller = require('./data.controller');
const { jsonSuccess } = require('../utils/jsonMessages');
const { authentication } = require('../utils/authManager');
const router = express.Router();

let database;
function setDatabase(_database) {
    database = _database;
    controller.setDatabase(database);
}
router.get('/:uuid', controller.get); //Get by UUID

module.exports = {
    router,
    setDatabase
};
