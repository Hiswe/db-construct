'use strict';

var _               = require('lodash');
var gulp            = require('gulp');
var $               = require('gulp-load-plugins')();
var args            = require('yargs').argv;
var cyan            = require('chalk').cyan;

var isDev           = args.prod !== true;

function onError(err) {
  $.util.beep();
  if (err.annotated)      { $.util.log(err.annotated); }
  else if (err.message)   { $.util.log(err.message); }
  else                    { $.util.log(err); }
  return this.emit('end');
}

console.log(cyan('build with env', isDev ? 'dev' : 'prod'));

////////
// CSS
////////

////////
// JS
////////

//----- LIBRARIES

//----- APPLICATION

////////
// ASSETS
////////

////////
// DEV
////////

var nodemonOptions = {
  script: 'index.js',
  ext:    'js json',
  watch:  ['server/**/*.js', '.dbconstructrc', 'index.js'],
};
var init = true;
gulp.task('nodemon', function (cb) {
  return $.nodemon(_.merge({env: { 'NODE_ENV': 'development' }}, nodemonOptions))
  .on('start', function () {
    // https://gist.github.com/sogko/b53d33d4f3b40d3b4b2e#comment-1457582
    if (init) {
      init = false;
      cb();
    }
  });
});

gulp.task('dev', ['nodemon']);
