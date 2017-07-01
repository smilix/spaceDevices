'use strict';

var fs = require('fs');

var config = require('./../config/environment/index');
var arp = require('./arp');
var log = require('./logging');


var COOKIE_NAME = 'macAuth';

function createNewSession(ip) {
  if (!ip) {
    throw new Error('Invalid ip: ' + ip);
  }
  // translate ipv6 addresses in the form "::ffff:192.168.2.167" into an ip v4 address
  var prefix = '::ffff:';
  if (ip.indexOf(prefix) === 0) {
    ip = ip.substring(prefix.length);
  }
  var mac = arp.getMacForIp(ip);
  if (!mac) {
    throw new Error('No mac found for ' + ip);
  }

  return {
    mac: mac,
    isLocallyAdministered: arp.isLocallyAdministered(mac)
  };
}


/**
 * Checks that the mac in the signed cookie matches the mac associated to the current ip.
 * Useful for important actions, like data modification.
 */
exports.checkCurrentCookieAuth = function (req) {
  var authData = req.signedCookies[COOKIE_NAME];
  if (!authData) {
    throw new Error('No auth from cookie');
  }
  var session = createNewSession(req.ip);
  if (authData.mac !== session.mac) {
    throw new Error('session mac and mac from ip do NOT match!');
  }
};

exports.interceptor = function () {
  return function macAuthInterceptor(req, res, next) {

    if (!req.signedCookies) {
      throw new Error('macAuthInterceptor must used after express cookie parser and signed cookies must be enabled.');
    }

    var authData = req.signedCookies[COOKIE_NAME];

    try {
      if (!authData) {
        // create new
        log.trace('Create new session for ', req.ip);
        authData = createNewSession(req.ip);
        res.cookie(COOKIE_NAME, authData, {
        secure: config.server.https,
          expires: 0,
          signed: true
        });
      } else {
        // still valid?
        log.trace('Auth data from cookie:', authData);
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