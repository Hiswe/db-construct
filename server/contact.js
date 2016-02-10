'use strict';

var nodemailer  = require('nodemailer');

var config      = require('./config');
var transporter = nodemailer.createTransport(config.emailTransport);

function getContact(req, res, next) {
  return res.render('contact', {
  });
}

function postMessage(req, res, next) {
  console.log(req.body);

  // nodemailer:
  // If callback argument is not set then the method returns a Promise object.
  var contactMail = transporter.sendMail({
    from:     req.body.email,
    to:       config.emailOptions.to,
    subject:  `[DBCONSTRUCT] a message from: ${req.body.name}`,
    html:     'contact mail',
  });

  var confirmationMail = transporter.sendMail({
    from:     config.emailOptions.to,
    to:       req.body.email,
    subject:  `[DBCONSTRUCT] Thank your for your message!`,
    html:     'confirmation mail',
  });

  Promise
    .all([contactMail, confirmationMail])
    .then(mailSend)
    .catch(mailError);

  function mailSend(info) {
    console.log('success');
    req.flash('success', true);
    res.redirect('contact');
  }

  function mailError(err) {
    console.log('error');
    console.log(err);
    req.flash('error', true);
    res.redirect('contact');
  }

  // transporter.sendMail(mailOptions);

}

module.exports = {
  get:  getContact,
  post: postMessage,
}
