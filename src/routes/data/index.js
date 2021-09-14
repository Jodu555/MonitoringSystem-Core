const express = require('express');
const controller = require('./controller');
const router = express.Router();

router.get('/:uuid', controller.get); //Get by UUID

module.exports = {
    router
};
