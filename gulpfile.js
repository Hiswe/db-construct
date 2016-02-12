'use strict';

var _               = require('lodash');
var del             = require('del');
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
    .pipe($.if(!isDev, $.uglifycss()))
    .pipe(gulp.dest('public'))
    .pipe(reload({stream: true}));
});

////////
// JS
////////

var browserify    = require('browserify');
var babelify      = require('babelify');
var envify        = require('envify/custom');
var vinylBuffer   = require('vinyl-buffer');
var source        = require('vinyl-source-stream');
var watchify      = require('watchify');

//----- LIBRARIES

//----- APPLICATION

gulp.task('app', function () {
  var b = browserify({
    cache:        {},
    packageCache: {},
    debug:        true,
    entries:      ['./js-front/index.js']
  });

  b.transform(babelify, {presets: ['es2015']})
  b.transform(envify({
    _: 'purge',
    NODE_ENV: isDev ? 'development' : 'production',
    LOG: isDev,
  }));

  if (isDev) {
    b = watchify(b);
    b.on('update', function () {
      bundleShare(b);
    });
  }

  return bundleShare(b);

});

function bundleShare(b) {
  $.util.log('bundle front app');

  return b.bundle()
    .pipe(source('db-construct.js'))
    .pipe(vinylBuffer())
    .pipe($.if(!isDev, $.uglify()))
    .pipe(gulp.dest('public'));
}

//----- ALL JS

gulp.task('js', ['app']);

////////
// ASSETS
////////

//----- ICONS

gulp.task('icons', function () {
  return gulp
    .src('public/icons/*.svg')
    .pipe($.svgmin({ plugins: [
      { removeAttrs: { attrs: ['fill', 'stroke'] } },
    ]}))
    .pipe($.svgSymbols({
      id: 'icon-%f',
      className: '.icon-%f',
    }))
    .pipe($.if( /[.]svg$/, gulp.dest('public')))
    .pipe($.if( /[.]css$/, gulp.dest('styl')));
});

//----- FONTS

gulp.task('del-fonts', function (cb) {
  return del(['public/fonts/*.woff'], cb);
});

gulp.task('fonts', ['del-fonts'], function () {
  return gulp
    .src('fonts.list')
    .pipe($.googleWebfonts())
    .pipe($.if(/[.]woff$/, gulp.dest('public/fonts')));
});

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

gulp.task('watch', ['browser-sync', 'js'], function () {
  // !! don't put ./ before path
  // http://stackoverflow.com/questions/22391527/gulps-gulp-watch-not-triggered-for-new-or-deleted-files
  gulp.watch(['styl/**/*.styl'],  ['css']);
  // gulp.watch(['assets/js/**/*.js'],     ['app-watch'], reload);
  gulp.watch('server/views/**/*.jade').on('change', reload);
});

gulp.task('dev', ['watch']);

////////
// DEPLOY
////////

gulp.task('bump', function(){
  gulp.src('./*.json')
  .pipe($.bump({version: args.pkg}))
  .pipe(gulp.dest('./'));
});

gulp.task('build', ['fonts', 'js', 'css']);
