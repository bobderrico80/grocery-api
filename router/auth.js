const express = require('express');
const { login } = require('../controller/auth');
const { create } = require('../controller/user');

const router = express.Router();

router.post('/register', create);
router.post('/login', login);

module.exports = { router };
