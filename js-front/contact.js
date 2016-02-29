import serialize from 'form-serialize';

import logger from './_logger';
import * as utils from './_utils';

var log       = logger('form', false);
const $ui     = {};

function init() {
  $ui.form = utils.$('form');
  if (!$ui.form) return log('abort');
  log('init');
  bindUi();
  bindEvents();
}

function bindUi() {
  $ui.process = utils.$('.js-process', $ui.form);
  $ui.success = utils.$('.js-success', $ui.form);
  $ui.error   = utils.$('.js-error', $ui.form);
}

function bindEvents() {
  $ui.form.addEventListener('submit', onSubmit);
  $ui.success.addEventListener('click', reinitForm);
  $ui.error.addEventListener('click', reinitForm);
  $ui.success.appendChild(utils.svgIcon('close'));
  $ui.error.appendChild(utils.svgIcon('close'));
}

function onSubmit(e) {
  log('submit', serialize($ui.form, {hash: true}));
  e.preventDefault();
  utils.addClass($ui.form, 'is-disabled');
  utils.addClass($ui.process, 'is-visible');
  send()
    .then(checkStatus)
    .then(onSuccess, onError);
}

function reinitForm() {
  utils.removeClass($ui.form, 'is-disabled');
  utils.removeClass($ui.success, 'is-visible');
  utils.removeClass($ui.error, 'is-visible');
}

function onSuccess(res) {
  log('success');
  utils.removeClass($ui.process, 'is-visible');
  utils.addClass($ui.success, 'is-visible');
}

function onError(res) {
  log('error');
  utils.removeClass($ui.process, 'is-visible');
  utils.addClass($ui.error, 'is-visible');
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
    body: JSON.stringify(serialize($ui.form, {hash: true})),
  })

  return Promise.all([utils.wait(2000), contact]);
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
