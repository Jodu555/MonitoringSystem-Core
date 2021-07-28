const express = require('express');
const controller = require('./server.controller');
const { jsonSuccess } = require('../utils/jsonMessages');
const { authentication } = require('../utils/authManager');
const router = express.Router();

let database;
function setDatabase(_database) {
    database = _database;
    controller.setDatabase(database);
}

router.get('/', controller.getAll); //Get All
router.get('/:uuid', controller.get); //Get by UUID
router.post('/', controller.create); //Create a new
router.patch('/:uuid', controller.patch); //Update by UUID

module.exports = {
    router,
    setDatabase
};