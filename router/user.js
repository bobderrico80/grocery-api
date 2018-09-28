const express = require('express');
const { authenticate } = require('../lib/auth');
const {
  getAll, getOne, create, update, destroy,
} = require('../controller/user');

const router = express.Router();

const middleware = [authenticate];

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', destroy);

module.exports = { router, middleware };
