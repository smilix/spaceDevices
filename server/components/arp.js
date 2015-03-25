'use strict';

var fs = require('fs');
var spawn = require('child_process').spawn;
var Q = require('q');

var config = require('./../config/environment/index');
var log = require('./logging');


function readArpCache() {
  var data, cols, i, lines, result = [];
  data = fs.readFileSync(config.arp.device);
  lines = data.toString().split('\n');
  for (i = 0; i < lines.length; i++) {
    if (i === 0) {
      // the first line contains the header
      continue;
    }

    cols = lines[i].split(/\s+/);
    if (cols.length !== 6) {
      continue;
    }

    // cols array contains:
    // IP address, HW type, Flags, HW address, Mask, Device
    var entry = {
      ip: cols[0],
      hwType: cols[1],
      flags: cols[2],
      hwAddress: cols[3],
      maks: cols[4],
      device: cols[5]
    };

    if (entry.flags !== '0x2' || entry.device !== config.arp.lanDevice) {
      continue;
    }

    result.push(entry);
  }

  return result;
}


exports.getMacForIp = function (ip) {
  var macList = readArpCache();
  for (var i = 0; i < macList.length; i++) {
    if (macList[i].ip === ip) {
      return macList[i].hwAddress;
    }
  }

  return null;
};


/**
 *
 * @returns {Array}
 */
exports.readArpCache = readArpCache;

/**
 *
 * @param ip
 * @returns {promise}
 */
exports.arping = function (ip) {
  var deferred = Q.defer();
  var pingProcess = spawn(config.arp.arping, [ '-r', '-i', config.arp.lanDevice, '-c', config.arp.pingCount, ip]);

  var result = '', errResult = '';
  pingProcess.stdout.on('data', function (data) {
    result += data;
  });
  pingProcess.stderr.on('data', function (data) {
    errResult += data;
  });

  pingProcess.on('error', function (error) {
    console.error('Could not call the arping program.', error);
    deferred.reject('Could not call the arping program.');
  });

  pingProcess.on('close', function (code) {
    if (code !== 0) {
      log.trace('arping !== 0', code, 'result', errResult);
      if (errResult.length > 0) {
        // not a normal error
        deferred.reject('Error response from arping: ' + errResult);
      } else {
        // arping could not find the requested ip
        deferred.resolve(null);
      }
      return;
    }

    var firstLine = result.split('\n')[0];

    // empty response means nothing found
    if (firstLine.length === 0) {
      deferred.resolve(null);
      return;
    }
    log.trace('arping success resolve', firstLine);
    deferred.resolve(firstLine);
  });

  return deferred.promise;
};