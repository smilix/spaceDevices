'use strict';

var fs = require('fs');

var config = require('./../../config/environment');

var data;

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

function getData() {
  if (!data) {
    console.log('Loading userDb');
    data = loadJsonFile(config.userDeviceData.jsonDb);
  }
  return data;
}

exports.getName = function (mac) {
  var entry = getData()[mac];
  if (!entry) {
    return null;
  }
  return entry.name;
};

exports.setName = function (mac, name) {
  var data = getData();
  data[mac] = {
    name: name,
    ts: Date.now()
  };
  saveJsonFile(config.userDeviceData.jsonDb, data);
};

exports.deleteName = function (mac) {
  var data = getData();
  data[mac] = undefined;
  saveJsonFile(config.userDeviceData.jsonDb, data);
};