'use strict';

var nodemailer  = require('nodemailer');

var config      = require('./config');

// var transporter = nodemailer.createTransport(config.emailTransport);

function getContact(req, res, next) {
  return res.render('contact');
}

function postMessage(req, res, next) {
  console.log(req.body);
  return res.render('contact');
}

module.exports = {
  get:  getContact,
  post: postMessage,
}
