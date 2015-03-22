'use strict';

var userDb = require('./../../components/userDb');


// Get list of macs
exports.getName = function(req, res) {
  var name = userDb.getName(req.macAuth.mac);
  res.json({
    mac: req.macAuth.mac,
    name: name
  });
};

exports.setName = function (req, res) {
  console.log('Set name "', req.body.name, '" for mac ', req.macAuth.mac);
  userDb.setName(req.macAuth.mac, req.body.name);
  res.json({});
};

exports.deleteName = function (req, res) {
  console.log('Delete name for mac ', req.macAuth.mac);
  userDb.deleteName(req.macAuth.mac);
  res.json({});
};