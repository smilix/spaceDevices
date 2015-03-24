'use strict';

var fs = require('fs');

var config = require('./../config/environment/index');
var arp = require('./arp');
var log = require('./logging');


function getMacForIp(ip) {
  var macList = arp.readArpCache();
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
        log.trace('Create new session for ', req.ip);
        authData = createNewSession(req.ip);
        res.cookie(cookieName, authData, {
//        secure: true,
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