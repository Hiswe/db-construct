import raf from 'raf';
import logger from './_logger';
import {svgIcon} from './_utils';
import $ from './_dom';

const log = logger('lightbox', true);
const $ui  = {};

function init() {
  $ui.el = $('.js-lightbox');
  if (!$ui.el.length) return log('abort');;
  log('init');
  bindUi();
  bindEvents();
  raf( () => $ui.body.append($ui.lightbox));
}

function bindUi() {
  $ui.body     = $('body');
  $ui.items    = $('.js-lightbox-item', $ui.el[0]);
  $ui.lightbox = $(`
<div class="lightbox-wrapper js-lightbox">
  <div class="lightbox-close js-lightbox-close"></div>
</div>
`);
  $ui.close         = $ui.lightbox.find('.js-lightbox-close');
  $ui.close.append(svgIcon('close'));
  $ui.imageWrapper  = $ui.lightbox.find('.lightbox');
}

function bindEvents() {
  $ui.lightbox.on('click', function (e) {
    close();
  });
  $ui.items.on('click', function (e) {
    e.preventDefault();
    open();
    build(e);
  });
}

////////
// LIGHTBOX
////////

let isOpen = false;

function open() {
  if (isOpen) return;
  $ui.lightbox.addClass('is-open');
  log('open');
  isOpen = true;
}

function close() {
  if (!isOpen) return;
  $ui.lightbox.removeClass('is-open');
  log('close');
  isOpen = false;
  $ui.img.remove();
}

function build(e) {
  var $link = $(e.currentTarget);
  var url   = $link.attr('href');
  $ui.lightbox.append(`<div class="lightbox-image js-lightbox-image"></div>`);
  $ui.img = $ui.lightbox.find('.js-lightbox-image');
  bgLoad(url, function () {
    log('loaded', $ui.img);
    $ui.img
      .css('backgroundImage', `url(${url})`)
      .addClass('is-loaded');
  });
}

// from:
// https://github.com/aFarkas/lazysizes/blob/gh-pages/plugins/unveilhooks/ls.unveilhooks.js#L33

function bgLoad(url, cb){
  let img       = document.createElement('img');
  img.onload    = function () {
    img.onload  = null;
    img.onerror = null;
    img = null;
    cb();
  };
  img.onerror = img.onload;
  img.src     = url;
  if (img && img.complete && img.onload) {
    img.onload();
  }
};

////////
// EXPORTS
////////

export default init;
