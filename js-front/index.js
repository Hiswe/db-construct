// NTH === Nice To Have

// https://github.com/aFarkas/lazysizes
// http://afarkas.github.io/lazysizes/#examples
import 'picturefill';
import 'lazysizes';
import svg4everybody from 'svg4everybody';
import {polyfill as promisePolyfill} from 'es6-promise';
import 'whatwg-fetch';

// for fast click, might want to look at:
// https://github.com/hammerjs/hammer-time
import logger from './_logger';
import project from './project';
import carrousel from './carrousel';
import contact from './contact';
import map, {mapInit} from './map';
import lightbox from './lightbox';
import * as utils from './_utils';
import {default as $, hasSupport} from './_dom';

const log     = logger('app', false);
log('init');

// enable support for external source
svg4everybody();
// enable promises
promisePolyfill();

// Flexbox check – IE10+
// http://johanronsse.be/2016/01/03/simple-flexbox-check/
var doc     = document.body || document.documentElement;
var style   = doc.style;
var hasFlex = false;

if (style.webkitFlexWrap == '' || style.msFlexWrap == '' || style.flexWrap == '' ) {
  hasFlex = true;
}

document.body.classList.remove('no-script');

// Double reload the app (search “Double-reload needed” in the link below)
// http://gregsramblings.com/2012/05/28/html5-application-cache-how-to/
if (window.applicationCache) {
  applicationCache.addEventListener('updateready', function() {
    if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
      window.applicationCache.swapCache();
      window.location.reload();
    }
  });
}

init();

// need to wrap in a funciton for being abled to do a return
function init() {
  // “disable” JS for < IE10
  if (!hasSupport() && !hasFlex) { return log('app disbaled'); };

  log('app enabled');

  project();
  contact();
  carrousel();
  lightbox();
  // google map new a global callback
  window.dbConstruct = {mapInit: mapInit};
  map();

  // DEBUG
  if (process.env.NODE_ENV === 'development') {
    const gridTmpl = `
      <div class="demo-grid">
        <ul>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>
    `;
    utils.$('body').appendChild(utils.parseHTML(gridTmpl)[0]);
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
