const express = require('express');
const controller = require('./server.controller');
const { jsonSuccess } = require('../utils/jsonMessages');
const router = express.Router();

let database;
function setDatabase(_database) {
    database = _database;
    controller.setDatabase(database);
}

router.get('/', null); //Get All
router.get('/:uuid', null); //Get by UUID
router.post('/', null); //Create a new
router.patch('/:uuid', null); //Update by UUID

module.exports = {
    router,
    setDatabase
};
