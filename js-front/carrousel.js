// NTH no playing when page not visible
// https://www.npmjs.com/package/visibilityjs
// import Visibility   from 'visibilityjs';
import Hammer         from 'hammerjs';
import raf            from 'raf';
import transitionend  from 'transitionend-property';

import logger         from './_logger';
import controlTmpl    from '../server/views/front-end/carrousel-control.pug';
import {svgIcon}      from './_utils';
import $              from './_dom';

const isLogging = false;
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
  },
};

function init() {
  var carrousels = $('.js-carrousel');
  if (!carrousels.length) return log('abort')
  log('init', carrousels.length, 'carrousels');
  carrousels.forEach(setup)
}

function setup(el, index) {
  const log     = logger('carrousel_' + index++, isLogging);
  const $ui     = {
    el:     $(el),
    slides: $('li', el)
  };
  const conf    = configs[el.getAttribute('data-carrousel')];
  const length  = $ui.slides.length;
  let current   = 0;
  let isMoving  = false;
  let timer     = false;
  if (!length) return log('abort');
  log('init with', length, 'slides');
  // log(Visibility.visible());

  bindUi();
  bindEvents();
  organize(0);

  function bindUi() {
    $ui.carrousel = $ui.el.find('.in');
    // controls
    $ui.control   = $(controlTmpl({max: length}));
    $ui.prev      = $ui.control.find('.js-prev');
    $ui.next      = $ui.control.find('.js-next');
    $ui.nav       = $ui.control.find('.js-carrousel-progress li');
    // Has to create SVG in SVG namespace ¬_¬'
    $ui.prev.append(svgIcon(Array.isArray(conf.icon) ? conf.icon[0] : conf.icon));
    $ui.next.append(svgIcon(Array.isArray(conf.icon) ? conf.icon[1] : conf.icon));
    $ui.el.append($ui.control);

    $ui.el.addClass('is-active');
    $ui.nav.eq(0).addClass('is-active');
  }

  function bindEvents() {
    new Hammer($ui.prev[0]).on('tap', () => { moveTo(-1) });
    new Hammer($ui.next[0]).on('tap', () => { moveTo( 1) });
    new Hammer($ui.el[0]).on('swipe', e =>  { moveTo(e.direction === 2 ? 1 : -1 )} );
    // after each transition reorgnaize the carrousel for the next one
    $ui.carrousel.on(transitionend, function (e) {
      if (e.propertyName !== 'transform') return;
      log('transition end');
      // need the raf to prevent transition…
      raf( () => {organize(current) });
    });
  }

  function autoSlide() {
    log('auto-slide');
    timer = setTimeout( () => { moveTo(1) }, configs.delay);
  }

  function organize(index) {
    var $previous = $ui.slides.eq(index === 0 ? length - 1 : index - 1);
    var $slide    = $ui.slides.eq(index);
    var $next     = $ui.slides.eq(index + 1 < length ? index + 1 : 0);
    // nextnext is there because carrousel is only 90% wide
    // when transitioning it makes a flicker if the last item just happen to nod be on the right position
    var $nextnext = $ui.slides.eq(index + 2 < length ? index + 2 : 0);
    let $all      = $previous.add($slide).add($next).add($nextnext);
    // IE10: -ms-flex-order
    $all.css('order', (elem, i) => i );
    $all.css('-ms-flex-order', (elem, i) => i );
    $ui.slides.forEach( s => { if ($all.indexOf(s) < 0) s.style.order = 5; });
    $ui.slides.forEach( s => { if ($all.indexOf(s) < 0) s.style['-ms-flex-order'] = 5; });

    $ui.carrousel.addClass('no-transition');
    setTransform(1);
    // raf is needed here also to REALLY prevent transition
    raf(function () {
      $ui.carrousel.removeClass('no-transition');
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
    if (timer) {
      log('clear', timer);
      clearTimeout(timer);
      timer = false;
    };

    // slide organization will be done on transition end;
    setTransform(direction > 0 ? 2 : 0);

    // update nav
    $ui.nav.eq(current).removeClass('is-active');
    $ui.nav.eq(nextState).addClass('is-active');
    // alldone!
    current = nextState;
  }

  function setTransform(step) {
    $ui.carrousel.css('transform', `translate3d(-${step * 90}%, 0px, 0px)`);
  }
}

////////
// EXPORTS
////////

export default init;
