import svg4everybody from 'svg4everybody';
import picturefill from 'picturefill';

// const $ = require('jquery');
// const raf = require('raf');
// import * as $$ from 'dominus';
import logger from './_logger';
import project from './project';


const log     = logger('app', true);
log('init');

// enable support for external source
svg4everybody();

// http://gomakethings.com/ditching-jquery#cutting-the-mustard
// !!document.querySelector;
var enableJsApp = !!document.querySelector && !!window.addEventListener;

if (enableJsApp) {

  log('app enabled');
  project();

  if (process.env.NODE_ENV === 'development') {

    let grid    = document.querySelector('.demo-grid');
    let isOpen  = false;

    document.addEventListener('keyup', toggleGrid);
    function toggleGrid(e) {
      if (e.keyCode !== 27) return;
      if (isOpen) grid.style.display = 'none';
      if (!isOpen) grid.style.display = 'block';
      isOpen = !isOpen;
    }
  }

}
