import svg4everybody from 'svg4everybody';
import picturefill from 'picturefill';

// const raf = require('raf');
import logger from './_logger';
import project from './project';
import carrousel from './carrousel';

// for fast click, might want to look at:
// https://github.com/hammerjs/hammer-time

const log     = logger('app', false);
log('init');

// enable support for external source
svg4everybody();

// http://gomakethings.com/ditching-jquery#cutting-the-mustard – IE9+
var enableJsApp = !!document.querySelector && !!window.addEventListener;

if (enableJsApp) {

  log('app enabled');
  project();
  carrousel();

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
