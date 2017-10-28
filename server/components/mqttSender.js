'use strict';

const MAX_NOT_SEND_ERRORS = 10;
// this results in "no one visible" which is not correct, the best we can do here
const EMPTY_DEVICES = '{"deviceCount":0,"unknownDevicesCount":0,"peopleCount":0,"people":[]}';

var fs = require('fs');
var Q = require('q');
var mqtt = require('mqtt');

var config = require('./../config/environment/index');
var log = require('./logging');

var client = null;
var couldNotSendErrorCount = 0;

connect();

function connect() {
  var opts = {
    ca: fs.readFileSync(config.mqtt.ca),
    username: config.mqtt.username,
    password: config.mqtt.password,
    clientId: 'spaceDevices',
    // if the client disconnects, we reset the topic
    will: {
      topic: config.mqtt.topic,
      payload: EMPTY_DEVICES,
      retain: true
    }
  };
  client = mqtt.connect(config.mqtt.server, opts);

  client.on('connect', function () {
    log.info('Connected to mqtt');
  });

  client.on('error', function (error) {
    console.error('Error connecting to mqtt server:', error);
  });

  client.on('offline', function () {
    log.info('mqtt client is offline');
  })
}

/**
 * @param {object} devicesData
 */
exports.sendDevices = function (devicesData) {
  if (client === null || !client.connected) {
    log.info('Client is not connected. Skip sending.');
    couldNotSendErrorCount++;

    if (couldNotSendErrorCount > MAX_NOT_SEND_ERRORS) {
      log.info('Could not publish to mqtt for', couldNotSendErrorCount, 'times. End the client and create a new one.');
      client.end(true);
      client = null;
      couldNotSendErrorCount = 0;
      // wait 2 seconds to connect again
      setTimeout(connect, 2000);
    }
    return;
  }

  var asString = JSON.stringify(devicesData);
  log.debug('sending ' + asString);
  var opts = {
    retain: true
  };
  client.publish(config.mqtt.topic, asString, opts, function () {
    couldNotSendErrorCount = 0;
  });
};