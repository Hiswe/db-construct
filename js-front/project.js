import Masonry from 'masonry-layout';
import logger from './_logger';
import $          from './_dom';

var log     = logger('project', false);
const $ui   = {};

function init() {
  log('init');

  $ui.grid = $('.js-grid');
  if (!$ui.grid.length) return log('abort');

  bindUi();

  log('init masonry');
  var msnry = new Masonry($ui.grid[0], {
    itemSelector: '.grid-item',
    columnWidth: '.js-grid-sizer',
    percentPosition: true,
    gutter: 24,
    initLayout: false,
    transitionDuration: 0,
  });
  $ui.grid.addClass('is-loaded');
  msnry.layout();
}

function bindUi() {
  log($ui.grid);
  $ui.spacer = $('<div class="js-grid-sizer grid-sizer"></div>');
  $ui.grid.prepend($ui.spacer[0]);
}

////////
// EXPORTS
////////

export default init;
