/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var config = require('./config/environment');
// Setup server
var app = express();
var server;
if (config.server.https) {
  var fs = require('fs');
  server = require('https').createServer({
    key: fs.readFileSync(config.server.key),
    cert: fs.readFileSync(config.server.cert)
  }, app);
} else {
  server = require('http').createServer(app);
}
require('./config/express')(app);
require('./routes')(app);

// Start server
server.listen(config.server.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.server.port, app.get('env'));
});

require('./components/deviceUpdater');

// Expose app
exports = module.exports = app;

