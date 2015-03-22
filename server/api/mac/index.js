'use strict';

var express = require('express');
var controller = require('./mac.controller');

var router = express.Router();

router.get('/', controller.getName);
router.put('/', controller.setName);
router.delete('/', controller.deleteName);


module.exports = router;