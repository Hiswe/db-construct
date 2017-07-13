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
  const data                  = req.body
  let domenicoMsg             = data.message.replace(/\n/g, '<br>');
  if (data.phone) domenicoMsg = `${domenicoMsg}
<p>Phone: <a href="tel:${data.phone}">${data.phone}</a></p>
`;
  domenicoMsg = `from: ${data.name}
<br>
<br>
${domenicoMsg}
`
  // to prevent yahoo DMARC block messages
  // change sender email domain to a banjai domain name
  // https://sendgrid.com/blog/yahoo-dmarc-update/
  var fromAddress = `${data.email.split('@')[0]}@db-construct.com`
  var contactMail       = transporter.sendMail({
    from:     `${data.name} - ${data.email} <${fromAddress}>`, // modified customer email
    to:       config.emailOptions.to,
    replyTo:  data.email, // customer email
    // subject:  `[DBCONSTRUCT] information demand ${req.body.name}`,
    subject:  `[DB-CONSTRUCT] information demand`,
    html:     domenicoMsg,
  });
  var confirmationMail  = transporter.sendMail({
    from:     config.emailOptions.to,
    to:       data.email,
    subject:  `[DB-CONSTRUCT] Thank your for your message!`,
    html:     mailing[req.getLocale()],
  });
  return Promise.all([contactMail, confirmationMail])
}

module.exports = {
  get:  getContact,
  post: postMessage,
}
