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
  document.addEventListener('lazybeforeunveil', show);
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
  $ui.lightbox.append(makeImage($link.attr('href')));
  $ui.img = $ui.lightbox.find('.js-lightbox-img');
}

function show(e) {
  let $img = $(e.target);
  if (!$img.hasClass('js-lightbox-img')) return;
  log('image loaded');
  $img
    .css('backgroundImage', `url(${$img.attr('data-src')})`)
    .addClass('is-loaded');
}

function makeImage(href) {
  return `<div class="lightbox-image lazyload js-lightbox-img" data-src=${href}></div>`;
}

function next(e) {

}

function prev(e) {

}

////////
// EXPORTS
////////

export default init;
