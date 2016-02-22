import Hammer       from 'hammerjs';
import raf          from 'raf';

import logger       from './_logger';
import controlTmpl  from '../server/views/front-end/carrousel-control.jade';
import * as utils   from './_utils';

const log     = logger('carrousel', true);

function init() {
  var carrousels = [...document.querySelectorAll('.js-carrousel')];
  if (!carrousels.length) return log('abort')
  log('init', carrousels.length, 'carrousels');
  carrousels.forEach(setup)
}

function setup(el, index) {
  index++;
  const log     = logger('carrousel_' + index, true);
  const $ui     = {
    el,
    slides: [...el.querySelectorAll('li')]
  };
  const length  = $ui.slides.length;
  var current   = 0;
  if (!length) return log('abort');
  log('init with', length, 'slides');

  bindUi();
  bindEvents();
  organize(0);

  function bindUi() {
    $ui.carrousel = $ui.el.querySelector('.in');
    $ui.slides    = [...$ui.carrousel.querySelectorAll('li')];
    // add controls
    $ui.control   = utils.parseHTML(controlTmpl({max: length}))[0];
    $ui.prev      = $ui.control.querySelector('.js-prev');
    $ui.next      = $ui.control.querySelector('.js-next');
    $ui.nav       = [...$ui.control.querySelectorAll('.js-carrousel-progress li')];
    // Has to create SVG in SVG namespace ¬_¬'
    $ui.prev.appendChild(utils.svgIcon('big-arrow'));
    $ui.next.appendChild(utils.svgIcon('big-arrow'));
    el.appendChild($ui.control);

    utils.addClass($ui.el, 'is-active');
    utils.addClass($ui.nav[0], 'is-active');
  }

  function bindEvents() {
    new Hammer($ui.prev).on('tap', () => { moveTo(-1) });
    new Hammer($ui.next).on('tap', () => { moveTo( 1) });
    $ui.carrousel.addEventListener('transitionend', function () {
      // need the raf to prevent transition…
      raf( () => {organize(current) });
    });
  }

  function organize(index) {
    log('organize', index);

    $ui.slides.forEach( slide => slide.style.order = 5 )
    var $previous = index === 0 ? $ui.slides[length - 1] : $ui.slides[index - 1];
    var $slide    = $ui.slides[index];
    var $next     = index + 1 < length ? $ui.slides[index + 1] : $ui.slides[0];
    $previous.style.order = 0;
    $slide.style.order    = 1;
    $next.style.order     = 2;
    utils.addClass($ui.carrousel, 'no-transition');
    setTransform(1);

    raf(function () {
      utils.removeClass($ui.carrousel, 'no-transition');
    });
  }

  function moveTo(direction) {
    let nextState = current + direction;
    nextState     = nextState >= length ? 0 : nextState;
    nextState     = nextState < 0 ? length - 1 : nextState;

    // slide organization will be done on transition end;
    setTransform(direction > 0 ? 2 : 0);

    // update nav
    utils.removeClass($ui.nav[current], 'is-active');
    utils.addClass($ui.nav[nextState], 'is-active');
    // alldone!
    current = nextState;
  }


  function setTransform(step) {
    $ui.carrousel.style.transform = `translateX(-${step * 90}%)`;
  }
}

////////
// EXPORTS
////////

export default init;
