import Masonry from 'masonry-layout';
import logger from './_logger';
import * as utils from './_utils';

var log     = logger('project', true);
const $ui   = {};

function init() {
  log('init');

  $ui.grid = document.querySelector('.js-grid');
  if (!$ui.grid) return log('abort');

  bindUi();

  log('init masonry');
  var msnry = new Masonry($ui.grid, {
    itemSelector: '.grid-item',
    columnWidth: '.js-grid-sizer',
    percentPosition: true,
    gutter: 24,
    initLayout: false,
    transitionDuration: 0,
  });

  // msnry.on('on', 'layoutComplete', function() {
  //   log('layout is complete');
  // });

  window.addEventListener('load', function () {
    msnry.layout();
  });
}

function bindUi() {
  log($ui.grid);
  $ui.spacer = utils.parseHTML('<div class="js-grid-sizer grid-sizer"></div>');
  $ui.grid.insertBefore($ui.spacer[0], $ui.grid.firstChild);
}

////////
// EXPORTS
////////

export default init;
