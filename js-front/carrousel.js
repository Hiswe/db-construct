import Hammer       from 'hammerjs';

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
  onFirst();

  function bindUi() {
    $ui.carrousel = $ui.el.querySelector('.in');
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
    new Hammer($ui.prev).on('tap', prev);
    new Hammer($ui.next).on('tap', next);

    function prev() {
      log('prev');
      moveTo(-1);
    }

    function next() {
      log('next');
      moveTo(1);
    }
  }

  function moveTo(direction) {
    let nextState = current + direction;
    nextState = nextState >= length ? 0 : nextState;
    nextState = nextState < 0 ? length - 1 : nextState;
    log(current, nextState);
    if (nextState === 0) {
      onFirst();
    } else  if (nextState === length - 1) {
      onLast();
    } else {
      onStep(nextState);
    }
    utils.removeClass($ui.nav[current], 'is-active');
    utils.addClass($ui.nav[nextState], 'is-active');
    // $ui.nav()
    current = nextState;
  }

  // on last : first-item become last
  // on first : last-item become first

  function onFirst() {
    utils.removeClass($ui.el, 'is-last');
    utils.addClass($ui.el, 'is-first');
    getTransform(1);
  }

  function onLast() {
    utils.removeClass($ui.el, 'is-first');
    utils.addClass($ui.el, 'is-last');
    getTransform(length - 2);
  }

  function onStep(step) {
    utils.removeClass($ui.el, 'is-last');
    utils.removeClass($ui.el, 'is-first');
    getTransform(step);
  }

  function getTransform(step) {
    $ui.carrousel.style.transform = `translateX(-${step * 90}%)`;
  }
}

////////
// EXPORTS
////////

export default init;
