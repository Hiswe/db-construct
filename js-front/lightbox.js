import raf        from 'raf';

import logger     from './_logger';
import {svgIcon}  from './_utils';
import $          from './_dom';

const log   = logger('lightbox', false);
const $ui   = {
  img: false,
};
let length    = 0;
let index     = false;
let isLoading = false;

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
  length       = $ui.items.length;
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
  $ui.close.on('click', close);
  $ui.prev.on('click', prev);
  $ui.next.on('click', next);
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

function close(e) {
  if (!isOpen) return;
  if (e && e.defaultPrevented) return;
  $ui.lightbox.removeClass('is-open');
  log('close');
  isOpen  = false;
  $ui.img.remove();
  $ui.img = false;
}

function build(e) {
  var $link = $(e.currentTarget);
  index = $ui.items.index($link);
  var url   = $link.attr('href');
  log('index is', index);
  $ui.lightbox.append(`<div class="lightbox-image js-lightbox-image"></div>`);
  $ui.img = $ui.lightbox.find('.js-lightbox-image');
  bgLoad(url, onImageLoaded);
}

function onImageLoaded(url) {
  // lightbox can be closed before the end of a loading
  if (!$ui.img) return isLoading = false;
  log('loaded');
  $ui.img
    .css('backgroundImage', `url(${url})`)
    .addClass('is-loaded');
  isLoading = false;
}

function prev(e) {
  log('prev');
  e.preventDefault();
  moveTo(-1);
}

function next(e) {
  log('next');
  e.preventDefault();
  moveTo(1);
}

function moveTo(direction) {
  if (!$ui.img) return;
  if (isLoading) return;
  let nextIndex = direction + index;
  nextIndex     = nextIndex < 0 ? length - 1 : nextIndex >= length ? 0 : nextIndex;
  let url       = $ui.items.eq(nextIndex).attr('href');
  log('move to', url);
  $ui.img.removeClass('is-loaded');
  index         = nextIndex;
  bgLoad(url, onImageLoaded);
}

// from:
// https://github.com/aFarkas/lazysizes/blob/gh-pages/plugins/unveilhooks/ls.unveilhooks.js#L33
function bgLoad(url, cb) {
  isLoading     = true;
  let img       = document.createElement('img');
  img.onload    = function () {
    img.onload  = null;
    img.onerror = null;
    img         = null;
    cb(url);
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
