const express = require('express');
const controller = require('./auth.controller');
const { jsonSuccess } = require('../utils/jsonMessages');
const authManager = require('../utils/authManager');
const router = express.Router();

router.get('/', (req, res) => {
    res.json(jsonSuccess('Auth-Router works just fine'));
});
router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/logout', authManager.authentication, controller.logout);
router.get('/emailValidation/:token', controller.emailValidation);

module.exports = {
    router,
};
