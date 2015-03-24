'use strict';

var express = require('express');
var controller = require('./mac.controller');

var router = express.Router();

router.get('/', controller.getDevice);
router.put('/', controller.updateDevice);
router.delete('/', controller.deleteDevice);


module.exports = router;