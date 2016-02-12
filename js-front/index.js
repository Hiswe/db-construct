const $ = require('jquery');
// const raf = require('raf');
// import * as $$ from 'dominus';
import logger from './_logger';

// window.$$ = $$;

const log     = logger('app', true);

log('init');

if (process.env.NODE_ENV === 'development') {
  let $grid = $('.demo-grid');
  $(document).on('keyup', function(e) {
    if (e.keyCode == 27) {
      $grid.toggle();
    };
  });
}
