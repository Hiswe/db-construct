'use strict';

var nodemailer  = require('nodemailer');

var config      = require('./config');
var transporter = nodemailer.createTransport(config.emailTransport);

function getContact(req, res, next) {
  return res.render('contact');
}

function postMessage(req, res, next) {
  if (req.xhr) console.log('ajax request');
  console.log(req.body);

  sendMails(req)
    .then(mailSend)
    .catch(mailError);

  function mailSend(info) {
    console.log('success');
    if (req.xhr) return res.json();
    req.flash('success', true);
    res.redirect('contact');
  }

  function mailError(err) {
    console.log('error');
    console.log(err);
    if (req.xhr) return res.status(500).json(err);
    req.flash('error', true);
    res.redirect('contact');
  }
}

// nodemailer:
// If callback argument is not set then the method returns a Promise object.
function sendMails(req) {
  var contactMail      = transporter.sendMail({
    from:     req.body.email,
    to:       config.emailOptions.to,
    subject:  `[DBCONSTRUCT] a message from: ${req.body.name}`,
    html:     'contact mail',
  });
  var confirmationMail  = transporter.sendMail({
    from:     config.emailOptions.to,
    to:       req.body.email,
    subject:  `[DBCONSTRUCT] Thank your for your message!`,
    html:     'confirmation mail',
  });
  return Promise.all([contactMail, confirmationMail])
}

module.exports = {
  get:  getContact,
  post: postMessage,
}
