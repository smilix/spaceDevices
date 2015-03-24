'use strict';

var mqtt = require('mqtt');
var Q = require('q');
var fs = require('fs');

var config = require('./../config/environment/index');
var arp = require('./arp');
var macDb = require('./macDb');
var log = require('./logging');


function updateInInterval() {
  setTimeout(function () {
    updateDevicesOverMqtt();
    updateInInterval();
  }, 1000 * 60);
}

updateInInterval();

function updateDevicesOverMqtt() {
  log.debug('Start updateDevicesOverMqtt');

  var arpingPromises = [];

  arp.readArpCache().forEach(function (cacheEntry) {
    log.trace('Cache entry:', cacheEntry);

    arpingPromises.push(arp.arping(cacheEntry.ip));
  });

  Q.all(arpingPromises).done(
    function ok(responses) {
      responses = responses.filter(function (entry) {
        return !!entry;
      });

      log.debug(responses.length, 'arping responses');

      var devicesMaps = macDb.getAllDevices();

      var devicesCount = countOnlineSpaceDevices(responses, devicesMaps);

      // send per mqtt
      var client = mqtt.connect(config.mqtt.server, {
        ca: fs.readFileSync(config.mqtt.ca),
        username: config.mqtt.username,
        password: config.mqtt.password
      });
      client.on('error', function (error) {
        console.error('Error sending presence to mqtt server:', error);
      });

      var asString = JSON.stringify(devicesCount.result);
      log.debug('sending ' + asString);
      client.publish(config.mqtt.topic, asString, {}, function () {
        client.end();
      });
      log.info('mqtt update send. Unknown mac ids: ', devicesCount.meta.unknownMacIds);
    },
    function error(err) {
      console.error(err);
    });

}


/*
 Helper functions.
 */

function countOnlineSpaceDevices(devices, devicesMap) {
  // The rules:
  // - every device is count for deviceCount
  // - every device with mode=ignore is ignored and not count anywhere except deviceCount
  // - every unknown device (= not in the config) counts as one device
  // - a person counts as one person, even it is online with several devices
  // - All devices that belongs to a person are not count as device
  // - every person with mode=visible is shown in the online list by name

  var rawDevicesCounter = 0;
  var people = {};
  var unknownIds = [];
  devices.forEach(function (deviceId) {
    rawDevicesCounter++;
    deviceId = deviceId.toLowerCase();

    var entry = devicesMap[deviceId];

    // is the device unknown?
    if (!entry) {
      unknownIds.push(deviceId);
      return;
    }

    // count the device?
    if (entry.visibility === 'ignore') {
      return;
    }

    // if the device owner is already known, then it is also already count
    if (people[entry.name]) {
      return;
    }

    // add the owner and count the device
    people[entry.name] = entry.visibility;
  });
  // count the people and remove the hidden people from the list
  var peopleCount = 0;
  var publicList = [];
  for (var name in people) {
    if (people.hasOwnProperty(name)) {
      peopleCount++;
      if (people[name] === 'show') {
        publicList.push(name);
      }
    }
  }


  return {
    meta: {
      unknownMacIds: unknownIds
    },
    result: {
      deviceCount: rawDevicesCounter,
      unknownDevicesCount: unknownIds.length,
      peopleCount: peopleCount,
      people: publicList
    }
  };
}


// builds a maps from the configuration for a fast access
//function createMaps(devicesConfigList) {
//  var deviceMap = {};
//
//  for (var i = 0; i < devicesConfigList.length; i++) {
//    var nameBlock = devicesConfigList[i];
//
//    for (var ii = 0; ii < nameBlock.devices.length; ii++) {
//      var deviceId = nameBlock.devices[ii];
//      deviceId = deviceId.toLowerCase();
//      deviceMap[deviceId] = {
//        // id may be undefined!
//        id: nameBlock.id,
//        name: nameBlock.name,
//        mode: nameBlock.mode
//      };
//    }
//  }
//
//  return deviceMap;
//}