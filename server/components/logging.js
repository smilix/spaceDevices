'use strict';

var config = require('./../config/environment');



exports.trace = function (/* var args */) {
  if (config.logging.level > 1) {
    return;
  }
  var args = Array.prototype.slice.call(arguments);
  args.unshift('TRACE:');
  console.log.apply(console, args);
};

exports.debug = function (/* var args */) {
  if (config.logging.level > 2) {
    return;
  }
  var args = Array.prototype.slice.call(arguments);
  args.unshift('DEBUG:');
  console.log.apply(console, args);
};

exports.info = function () {
  if (config.logging.level > 3) {
    return;
  }
  var args = Array.prototype.slice.call(arguments);
  args.unshift('INFO:');
  console.log.apply(console, args);
};
