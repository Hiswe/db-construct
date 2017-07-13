'use strict';

var _       = require('lodash');
var path    = require('path');
var rc      = require('rc');

var config  = rc('dbconstruct', {
  "emailTransport": {
    "host": "localhost",
    "port": 1025
  },
  "emailOptions": {
    "to": "Domenico <info@db-construct.com>",
  }
});

config.NODE_ENV   = config.NODE_ENV || process.env.NODE_ENV || 'development';
config.PORT       = process.env.PORT || 3000;

config.isDev      = config.NODE_ENV === 'development';
config.isProd     = config.NODE_ENV === 'production';

console.log('config is');
console.log(_.omit(config, ['_', 'config', '_configs', 'configs']));

module.exports  = config;
