'use strict';

var fs = require('fs');
var config = require('./../../config/environment');

/**
 *
 * @returns {Array}
 */
function readArpCache() {
  var data, cols, i, lines, result = [];
  data = fs.readFileSync(config.arpCache.device);
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

    if (entry.flags !== '0x2' || entry.device !== config.arpCache.lanDevice) {
      continue;
    }

    result.push(entry);
  }

  return result;
}

function getMacForIp(ip) {
  var macList = readArpCache();
  for (var i = 0; i < macList.length; i++) {
    if (macList[i].ip === ip) {
      return macList[i].hwAddress;
    }
  }

  return null;
}

function createNewSession(ip) {
  var mac = getMacForIp(ip);
  if (!mac) {
    throw new Error('No mac found for ' + ip);
  }

  return {
    mac: mac
  };
}

exports.interceptor = function () {

  var cookieName = 'macAuth';

  return function macAuthInterceptor(req, res, next) {

    if (!req.signedCookies) {
      throw new Error('macAuthInterceptor must used after express cookie parser and signed cookies must be enabled.');
    }

    var authData = req.signedCookies[cookieName];

    try {
      if (!authData) {
        // create new
        console.log('Create new session for ', req.ip);
        authData = createNewSession(req.ip);
        res.cookie(cookieName, authData, {
//        secure: true,
          expires: 0,
          signed: true
        });
      } else {
        // still valid?
        console.log('known data:', authData);
        if (!authData.mac) {
          throw new Error('Invalid mac data');
        }
      }
    } catch (e) {
      console.error(e);
      res.status(403).send(e);
      return;
    }

    req.macAuth = authData;

    next();
  };

};