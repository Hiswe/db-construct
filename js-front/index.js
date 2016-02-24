import svg4everybody from 'svg4everybody';
import picturefill from 'picturefill';
import {polyfill as promisePolyfill} from 'es6-promise';
import 'whatwg-fetch';

// for fast click, might want to look at:
// https://github.com/hammerjs/hammer-time
import logger from './_logger';
import project from './project';
import carrousel from './carrousel';
import contact from './contact';

const log     = logger('app', false);
log('init');

// enable support for external source
svg4everybody();
// enable promises
promisePolyfill();

// TODO handle IE9 Layout?
// TODO light box page project

// Flexbox check – IE10+
// http://johanronsse.be/2016/01/03/simple-flexbox-check/
var doc     = document.body || document.documentElement;
var style   = doc.style;
var hasFlex = false;

if (style.webkitFlexWrap == '' || style.msFlexWrap == '' || style.flexWrap == '' ) {
  doc.className += ' has-flex';
  hasFlex = true;
} else {
  doc.className += ' no-flex';
}

// DOM VanillaJS check
// http://gomakethings.com/ditching-jquery#cutting-the-mustard – IE9+
var enableJsApp = !!document.querySelector && !!window.addEventListener;

if (enableJsApp) {

  log('app enabled');

  project();
  contact();
  // Carrousel is too dependant from flexbox
  // disable it on IE9
  if (hasFlex) carrousel();

  if (process.env.NODE_ENV === 'development') {

    let grid    = document.querySelector('.demo-grid');
    let isOpen  = false;

    document.addEventListener('keyup', toggleGrid);
    function toggleGrid(e) {
      if (e.keyCode !== 27) return;
      grid.style.display = isOpen ? 'none' : 'block';
      isOpen = !isOpen;
    }
  }

}
