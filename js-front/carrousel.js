import Hammer       from 'hammerjs';
import raf          from 'raf';

import logger       from './_logger';
import controlTmpl  from '../server/views/front-end/carrousel-control.jade';
import * as utils   from './_utils';

const isLogging = true;
const log       = logger('carrousel', isLogging);
const configs   = {
  delay: 5 * 1000,
  home: {
    autoSlide: true,
    icon:       'big-arrow'
  },
  process: {
    autoSlide: false,
    icon:      ['arrow-small-left', 'arrow-small-right'],
    // icon:      'clapou',
  },
};

function init() {
  var carrousels = utils.$$('.js-carrousel');
  if (!carrousels.length) return log('abort')
  log('init', carrousels.length, 'carrousels');
  carrousels.forEach(setup)
}

function setup(el, index) {
  const log     = logger('carrousel_' + index++, isLogging);
  const $ui     = {
    el,
    slides: utils.$$('li', el)
  };
  const conf    = configs[el.getAttribute('data-carrousel')];
  const length  = $ui.slides.length;
  let current   = 0;
  let isMoving  = false;
  let timer     = false;
  if (!length) return log('abort');
  log('init with', length, 'slides');

  bindUi();
  bindEvents();
  organize(0);

  function bindUi() {
    $ui.carrousel = $ui.el.querySelector('.in');
    $ui.slides    = utils.$$('li', $ui.carrousel);
    // controls
    $ui.control   = utils.parseHTML(controlTmpl({max: length}))[0];
    $ui.prev      = utils.$('.js-prev', $ui.control);
    $ui.next      = utils.$('.js-next', $ui.control);
    $ui.nav       = utils.$$('.js-carrousel-progress li', $ui.control);
    // Has to create SVG in SVG namespace ¬_¬'
    $ui.prev.appendChild(utils.svgIcon(Array.isArray(conf.icon) ? conf.icon[0] : conf.icon));
    $ui.next.appendChild(utils.svgIcon(Array.isArray(conf.icon) ? conf.icon[1] : conf.icon));
    el.appendChild($ui.control);

    utils.addClass($ui.el, 'is-active');
    utils.addClass($ui.nav[0], 'is-active');
  }

  function bindEvents() {
    new Hammer($ui.prev).on('tap', () => { moveTo(-1) });
    new Hammer($ui.next).on('tap', () => { moveTo( 1) });
    new Hammer($ui.el).on('swipe', e =>  { moveTo(e.direction === 2 ? 1 : -1 )} );
    // after each transition reorgnaize the carrousel for the next one
    $ui.carrousel.addEventListener('transitionend', function () {
      // need the raf to prevent transition…
      raf( () => {organize(current) });
    });
  }

  function autoSlide() {
    log('auto-slide');
    timer = setTimeout( () => { moveTo(1) }, configs.delay);
  }

  function organize(index) {
    var $previous = index === 0 ? $ui.slides[length - 1] : $ui.slides[index - 1];
    var $slide    = $ui.slides[index];
    var $next     = index + 1 < length ? $ui.slides[index + 1] : $ui.slides[0];
    // nextnext is there because carrousel is only 90% wide
    // when transitioning it makes a flicker if the last item just happen to nod be on the right position
    var $nextnext = index + 2 < length ? $ui.slides[index + 2] : $ui.slides[0];
    let $all              = [$previous, $slide, $next, $nextnext];
    //
    $all.forEach( (s, i) => { s.style.order = i;});
    $ui.slides.forEach( s => { if (!$all.includes(s)) s.style.order = 5; });

    utils.addClass($ui.carrousel, 'no-transition');
    setTransform(1);
    // raf is needed here also to REALLY prevent transition
    raf(function () {
      utils.removeClass($ui.carrousel, 'no-transition');
      isMoving  = false;
      if (conf.autoSlide) autoSlide();
    });
  }

  function moveTo(direction) {
    if (isMoving) return;
    isMoving      = true;
    let nextState = current + direction;
    nextState     = nextState >= length ? 0 : nextState;
    nextState     = nextState < 0 ? length - 1 : nextState;
    if (timer)    clearTimeout(timer);

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
