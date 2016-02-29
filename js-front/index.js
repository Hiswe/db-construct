// NTH === Nice To Have

// https://github.com/aFarkas/lazysizes
// http://afarkas.github.io/lazysizes/#examples
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
import * as utils from './_utils';

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

// DOM VanillaJS check
// http://gomakethings.com/ditching-jquery#cutting-the-mustard – IE9+
var enableJsApp = !!document.querySelector && !!window.addEventListener;

init();

function init() {
  // “disable” JS for < IE10
  if (!enableJsApp && !hasFlex) { return log('app disbaled'); };

  log('app enabled');

  project();
  contact();
  carrousel();
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
