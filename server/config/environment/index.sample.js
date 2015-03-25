'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if(!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server port
  port: process.env.PORT || 9000,

  // info 3, debug 2, trace 1
  logging: {
    //
    level: 2
  },

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: ''
  },

  arp: {
    device: '/proc/net/arp',
    lanDevice: 'eth1',
    arping: '/usr/sbin/arping',
    pingCount: 3
  },

  macDb: {
    // NOT a json file, this one is include with "require" and must have "exports = ..."
    masterFile: '/path/to/master/db/masterDb.js',
    // loaded as a JSON file
    userFile: '/path/to/user/db/userDb.json'
  },

  mqtt: {
    server: 'tls://your_server',
    ca: '/path/to/cert/ca.crt',
    topic: '/test/devices',
    username: 'user',
    password: 'pass'
  },

  server: {
    https: true,
    port: process.env.PORT || 9000,
    // for https
    key: '/path/to/key/server.key',
    cert: '/path/to/cert/server.cert'
  }


};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
    require('./' + process.env.NODE_ENV + '.js') || {});