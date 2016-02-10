'use strict';

var path    = require('path');
var rc      = require('rc');

var config  = rc('dbconstruct', {});

config.NODE_ENV   = config.NODE_ENV || process.env.NODE_ENV || 'development';
config.PORT       = process.env.PORT || 3000;

config.isDev      = config.NODE_ENV === 'development';
config.isProd     = config.NODE_ENV === 'production';

module.exports  = config;
