'use strict';

var fs          = require('fs');
var path        = require('path');
var nodemailer  = require('nodemailer');

var config      = require('./config');
var transporter = nodemailer.createTransport(config.emailTransport);
var mailing     = {
  en: fs.readFileSync(path.join(__dirname, '../public/mail-customer-en.html')),
  th: fs.readFileSync(path.join(__dirname, '../public/mail-customer-th.html')),
};

function getContact(req, res, next) {
  return res.render('contact');
}

function postMessage(req, res, next) {
  if (req.xhr) console.log('ajax request');
  console.log(req.body);
  if (!req.body.name || !req.body.email || !req.body.message) {
    return mailError(new Error('form is not valid'));
  }

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
  let domenicoMsg       = req.body.message.replace(/\n/g, '<br>');
  if (req.body.phone) domenicoMsg = `${domenicoMsg}
<p>Phone: <a href="tel:${req.body.phone}">${req.body.phone}</a></p>
`;
  var contactMail       = transporter.sendMail({
    from:     req.body.email,
    to:       config.emailOptions.to,
    // subject:  `[DBCONSTRUCT] information demand ${req.body.name}`,
    subject:  `[DB-CONSTRUCT] information demand`,
    html:     domenicoMsg,
  });
  var confirmationMail  = transporter.sendMail({
    from:     config.emailOptions.to,
    to:       req.body.email,
    subject:  `[DB-CONSTRUCT] Thank your for your message!`,
    html:     mailing[req.getLocale()],
  });
  return Promise.all([contactMail, confirmationMail])
}

module.exports = {
  get:  getContact,
  post: postMessage,
}
