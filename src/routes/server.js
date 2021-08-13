const express = require('express');
const controller = require('./data.controller');
const router = express.Router();

router.get('/', controller.getAll);
router.get('/:uuid', controller.get);
router.post('/', controller.create);
router.patch('/:uuid', controller.patch);

module.exports = {
    router
};
