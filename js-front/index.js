const $ = require('jquery');
const raf = require('raf');
// import * as $$ from 'dominus';
import logger from './_logger';

// window.$$ = $$;

const log     = logger('app', true);

log('init');

const $grid = $('.demo-grid');

raf(function () {
  $grid.hide();
});
// $grid.toggle();


$(document).on('keyup', function(e) {
  // var k = e.which;
  // console.log(e.keyCode, e.which);

  if (e.keyCode == 27) {
    $grid.toggle();
    // return pubsub('key:esc').publish()
  };
  // if(e.which == 13) return pubsub('key:return').publish();

  // var arrow = k === 37 ? 'left' : k === 38 ? 'up' : k === 39 ? 'right' : k === 40 ? 'down' : false;
  // if (arrow) pubsub('key:arrow').publish(arrow);
  // if (arrow === 'top' || arrow === 'down') e.preventDefault();
});


console.log(`hello world`);
