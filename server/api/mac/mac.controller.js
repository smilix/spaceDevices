'use strict';

var auth = require('./../../components/authByMac');
var macDb = require('./../../components/macDb');
var log = require('./../../components/logging');

// Get list of macs
exports.getDevice = function (req, res) {
  var device = macDb.getDevice(req.macAuth.mac);
  if (!device) {
    log.debug('No device data found for ', req.macAuth.mac);
    res.json({
      mac: req.macAuth.mac,
      isLocallyAdministered: req.macAuth.isLocallyAdministered,
      unknown: true
    });
    return;
  }
  var dataToSend = {
    mac: req.macAuth.mac,
    isLocallyAdministered: req.macAuth.isLocallyAdministered,
    name: device.name,
    visibility: device.visibility
  };
  log.debug('Send to client ', dataToSend);
  res.json(dataToSend);
};

exports.updateDevice = function (req, res) {
  log.info('Setting new options for mac"', req.macAuth.mac, ':', req.body);
  auth.checkCurrentCookieAuth(req);
  macDb.setDevice(req.macAuth.mac, {
    name: req.body.name,
    visibility: req.body.visibility || 'show'
  });
  res.json({});
};

exports.deleteDevice = function (req, res) {
  log.info('Delete name for mac ', req.macAuth.mac);
  auth.checkCurrentCookieAuth(req);
  macDb.deleteDevice(req.macAuth.mac);
  res.json({});
};