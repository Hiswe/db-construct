'use strict';

var gulp            = require('gulp');
var $               = require('gulp-load-plugins')();
var del             = require('del');
var lazypipe        = require('lazypipe');
var parallel        = require('concurrent-transform');
var os              = require('os');
var merge           = require('merge-stream');
var cpus            = os.cpus().length;

var src             = 'image-source';
var dst             = 'public/images';

//----- GM options

function resize(width, height) {
  return {
    width:        width,
    height:       height,
    crop:         true,
    upscale:      false,
    // imageMagick:  true
  }
}

//----- RENAME

var normalizeExt    = lazypipe().pipe($.rename, {extname: '.jpg'});
var big2x           = lazypipe().pipe($.rename, {suffix: '-big@2x'});
var medium2x        = lazypipe().pipe($.rename, {suffix: '-medium@2x'});
var small2x         = lazypipe().pipe($.rename, {suffix: '-small@2x'});
var unRetina        = lazypipe().pipe($.rename, function (path) {
  path.basename = path.basename.replace('@2x', '');
});

////////
// HOME
////////

//----- CARROUSEL

// source(media="(min-width: 1024px)" srcset="/image/1400x600 1x, /image/2800x1200 2x")
// source(media="(min-width: 640px)" srcset="/image/920x500 1x, /image/1840x1000 2x")
// img(src="/image/580x580", srcset="/image/580x580 1x, /image/1160x1160 2x")

var homeCarrouselDst = `${dst}/home/carrousel`;
var homeCarrouselSrc = lazypipe()
  .pipe(gulp.src, `${src}/home/carrousel/*.{jpg,JPG}`)
  .pipe(normalizeExt);

gulp.task('clean-carrousel', function(cb) {
  return del([homeCarrouselDst], cb);
});

gulp.task('home-carrousel', ['clean-carrousel'], function () {
  var write = lazypipe()
  .pipe(gulp.dest, homeCarrouselDst)
  .pipe(unRetina)

  var big = homeCarrouselSrc()
    .pipe(big2x())
    .pipe(parallel($.imageResize(resize(2800, 1200)), cpus))
    .pipe(write())
    .pipe(parallel($.imageResize(resize(1400, 600)), cpus));

  var medium = homeCarrouselSrc()
    .pipe(medium2x())
    .pipe(parallel($.imageResize(resize(1840, 1000)), cpus))
    .pipe(write())
    .pipe(parallel($.imageResize(resize(920, 500)), cpus));

  var small = homeCarrouselSrc()
    .pipe(small2x())
    .pipe(parallel($.imageResize(resize(1160, 1160)), cpus))
    .pipe(write())
    .pipe(parallel($.imageResize(resize(580, 580)), cpus));

  return merge([big, medium, small])
    .pipe(gulp.dest(homeCarrouselDst))

});
