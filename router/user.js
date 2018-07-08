const express = require('express');
const {
  getAll, getOne, create, update, destroy,
} = require('../controller/user');

const router = express.Router();

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', create);
router.put('/:id', update);
router.delete(':id', destroy);

module.exports = router;