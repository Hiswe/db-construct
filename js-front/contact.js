import serialize        from 'form-serialize';

import logger           from './_logger';
import {svgIcon, wait}  from './_utils';
import $                from './_dom';

var log       = logger('form', false);
const $ui     = {};

function init() {
  $ui.form = $('form');
  if (!$ui.form) return log('abort');
  log('init');
  bindUi();
  bindEvents();
}

function bindUi() {
  $ui.process = $ui.form.find('.js-process');
  $ui.success = $ui.form.find('.js-success');
  $ui.error   = $ui.form.find('.js-error');
}

function bindEvents() {
  $ui.form.on('submit', onSubmit);
  $ui.success.on('click', reinitForm);
  $ui.error.on('click', reinitForm);
  $ui.success.append(svgIcon('close'));
  $ui.error.append(svgIcon('close'));
}

function onSubmit(e) {
  e.preventDefault();
  let isValid = $ui.form[0].checkValidity();
  if (!isValid) return log.warn('abort submit: form is not valid');
  log('submit', serialize($ui.form, {hash: true}));
  $ui.form.addClass('is-disabled');
  $ui.process.addClass('is-visible');
  send()
    .then(checkStatus)
    .then(onSuccess, onError);
}

function reinitForm() {
  $ui.form.removeClass('is-disabled');
  $ui.success.removeClass('is-visible');
  $ui.error.removeClass('is-visible');
}

function onSuccess(res) {
  log('success');
  $ui.process.removeClass('is-visible');
  $ui.success.addClass('is-visible');
}

function onError(res) {
  log('error');
  $ui.process.removeClass('is-visible');
  $ui.error.addClass('is-visible');
}

function send() {
  let contact = fetch('/contact', {
    method: 'post',
    headers: {
      // This is for express to catch a XHR
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    // send session (fetch API by default omit it)
    // https://medium.com/@un.deter.red/fetch-doesn-t-send-cookies-by-default-f99ca4111774#.gsh5pk9a4
    credentials: 'include',
    body: JSON.stringify(serialize($ui.form[0], {hash: true})),
  })

  return Promise.all([wait(1000), contact]);
}

// https://github.com/github/fetch#handling-http-error-statuses
function checkStatus(response) {
  response = response[1];
  log(response);
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

////////
// EXPORTS
////////

export default init;
