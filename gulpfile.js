'use strict';

var _               = require('lodash');
var gulp            = require('gulp');
var $               = require('gulp-load-plugins')();
var browserSync     = require('browser-sync').create();
var reload          = browserSync.reload;
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

var autoprefixer  = require('autoprefixer');
// var pxtorem       = require('postcss-pxtorem');

// var cssDev        = lazypipe()
//   .pipe(dest.tmp)
//   // .pipe($.filter, ['*', '!*.map'])
//   .pipe(reload, {stream: true});

// var cssProd       = lazypipe()
//   .pipe($.minifyCss)
//   .pipe(addBanner)
//   .pipe(dest.dist)

gulp.task('css', function () {
  return gulp
    .src('styl/index.styl')
    .pipe($.plumber({errorHandler: onError}))
    .pipe($.if(isDev, $.sourcemaps.init()))
      .pipe($.stylus({
        'include css': true,
        define: {
          isProd: !isDev,
        }
      }))
      .pipe($.postcss([
        autoprefixer({
          browsers: ['> 1%', 'IE 9'],
        }),
        // pxtorem({replace: true}),
      ]))
      .pipe($.rename('db-construct.css'))
    .pipe(gulp.dest('public'))
    .pipe(reload({stream: true}));
    // .pipe($.if(isDev, cssDev(), cssProd()));
});

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

gulp.task('browser-sync', ['nodemon'], function () {
  browserSync.init({
    proxy: 'http://localhost:3000',
    open: false,
    port: 7000,
    ghostMode: false,
  });
});

gulp.task('watch', ['browser-sync'], function () {
  // !! don't put ./ before path
  // http://stackoverflow.com/questions/22391527/gulps-gulp-watch-not-triggered-for-new-or-deleted-files
  gulp.watch(['styl/**/*.styl'],  ['css']);
  // gulp.watch(['assets/js/**/*.js'],     ['app-watch'], reload);
  gulp.watch('server/views/**/*.jade').on('change', reload);
});

gulp.task('dev', ['watch']);
