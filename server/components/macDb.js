'use strict';

/*
 visibility types: show, ignore, anon
*/

var fs = require('fs');
var _ = require('lodash');

var config = require('./../config/environment/index');
var log = require('./logging');

var cachedUserDb;
var cachedMasterDb;

function loadJsonFile(file) {
  if (!fs.existsSync(file)) {
    return {};
  }

  var data = fs.readFileSync(file, 'utf8');
  return JSON.parse(data);
}

function saveJsonFile(file, data) {
  fs.writeFileSync(file, JSON.stringify(data));
}

function getUserData() {
  if (!cachedUserDb) {
    log.debug('Loading userDb');
    cachedUserDb = loadJsonFile(config.macDb.userFile);
  }
  return cachedUserDb;
}

function saveUserData() {
  if (!cachedUserDb) {
    return;
  }
  log.debug('Saving userDb');
  saveJsonFile(config.macDb.userFile, cachedUserDb);
}

function getMasterData() {
  if (!cachedMasterDb) {
    log.debug('Loading masterDb');
    var master = require(config.macDb.masterFile);
    cachedMasterDb = {};
    // convert into the same format as userDb
    master.ignoredDevices.forEach(function (ignoredMac) {
      ignoredMac = ignoredMac.toLowerCase();
      cachedMasterDb[ignoredMac] = {
        visibility: 'ignore'
      };
    });
  }

  return cachedMasterDb;
}

//
// PUBLIC
//

/**
 *
 * @param mac
 * @returns {object} with name, visibility, ts, master
 */
exports.getDevice = function (mac) {
  mac = mac.toLowerCase();
  var device = getMasterData()[mac];
  if (device) {
    device.master = true;
    return device;
  }

  return getUserData()[mac];
};

exports.setDevice = function (mac, options) {
  mac = mac.toLowerCase();
  if (getMasterData()[mac]) {
    throw new Error('Can´t update a device that is defined in the master file.');
  }
  var data = getUserData();

  options = _.clone(options);
  options.ts = Date.now();
  data[mac] = options;
  saveUserData();
};

exports.deleteDevice = function (mac) {
  mac = mac.toLowerCase();
  if (getMasterData()[mac]) {
    throw new Error('Can´t delete a device that is defined in the master file.');
  }
  var data = getUserData();
  data[mac] = undefined;
  saveUserData();
};

exports.getAllDevices = function () {
  return _.merge(getUserData(), getMasterData());
};