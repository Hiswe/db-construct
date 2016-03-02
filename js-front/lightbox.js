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
  <div class="lightbox-navigation">
    <div class="lightbox-prev js-lightbox-prev"></div>
    <div class="lightbox-next js-lightbox-next"></div>
  </div>
  <div class="lightbox-loader js-lightbox-loader"></div>
</div>
`);
  $ui.prev          = $ui.lightbox.find('.js-lightbox-prev');
  $ui.next          = $ui.lightbox.find('.js-lightbox-next');
  $ui.close         = $ui.lightbox.find('.js-lightbox-close');
  $ui.loader        = $ui.lightbox.find('.js-lightbox-loader');
  $ui.imageWrapper  = $ui.lightbox.find('.lightbox');
  // add SVG icons…
  $ui.prev.append(svgIcon('arrow-small-left'));
  $ui.next.append(svgIcon('arrow-small-right'));
  $ui.close.append(svgIcon('close-square'));
  $ui.loader.append(svgIcon('process'));
}

function bindEvents() {
  $ui.lightbox.on('click', close);
  $ui.items.on('click', function (e) {
    e.preventDefault();
    open();
    build(e);
  });
  document.addEventListener('keyup', onEscape);
}

////////
// LIGHTBOX
////////

let isOpen = false;

function onEscape(e) {
  if (e.keyCode !== 27) return;
  close();
}

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
