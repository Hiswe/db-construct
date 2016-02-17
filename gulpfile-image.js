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
var retina          = lazypipe().pipe($.rename, {suffix: '@2x'});
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

//----- EXPERTISE

// source(media="(min-width: 640px) and (max-width: 1023px)" srcset="/image/475x300 1x, /image/950x600 2x")
// img(src="/image/675x370", srcset="/image/675x370 1x, /image/1350x740 1x")

var homeExpertiseDst = `${dst}/home/expertise`;
var homeExpertiseSrc = lazypipe()
  .pipe(gulp.src, `${src}/home/expertise/*.{jpg,JPG}`)
  .pipe(normalizeExt);

gulp.task('clean-expertise', function(cb) {
  return del([homeExpertiseDst], cb);
});

gulp.task('home-expertise', ['clean-expertise'], function () {
  var write = lazypipe()
  .pipe(gulp.dest, homeExpertiseDst)
  .pipe(unRetina)

  var medium = homeExpertiseSrc()
    .pipe(medium2x())
    .pipe(parallel($.imageResize(resize(1340, 740)), cpus))
    .pipe(write())
    .pipe(parallel($.imageResize(resize(675, 370)), cpus));

  var small = homeExpertiseSrc()
    .pipe(small2x())
    .pipe(parallel($.imageResize(resize(950, 600)), cpus))
    .pipe(write())
    .pipe(parallel($.imageResize(resize(475, 300)), cpus));

  return merge([medium, small])
    .pipe(gulp.dest(homeExpertiseDst))
});

//----- ALL HOME

gulp.task('home', ['home-carrousel', 'home-expertise']);

////////
// PROCESS
////////

// source(media="(min-width: 1024px)" srcset="/image/920x420 1x, /image/1840x840 2x")
// source(media="(min-width: 640px)" srcset="/image/880x420 1x, /image/1760x840 2x")
// img(src="/image/580x400", srcset="/image/580x400 1x, /image/1160x800 2x")

var processDst = `${dst}/process`;
var processSrc = lazypipe()
  .pipe(gulp.src, `${src}/process/**/*.{jpg,JPG}`, {base: `${src}/process`})
  .pipe(normalizeExt);

gulp.task('clean-expertise', function(cb) {
  return del([processDst], cb);
});
gulp.task('process', ['clean-expertise'], function() {
  var write = lazypipe()
  .pipe(gulp.dest, processDst)
  .pipe(unRetina)

  var big = processSrc()
    .pipe(big2x())
    .pipe(parallel($.imageResize(resize(1840, 840)), cpus))
    .pipe(write())
    .pipe(parallel($.imageResize(resize(920, 420)), cpus));

  var medium = processSrc()
    .pipe(medium2x())
    .pipe(parallel($.imageResize(resize(1760, 840)), cpus))
    .pipe(write())
    .pipe(parallel($.imageResize(resize(880, 420)), cpus));

  var small = processSrc()
    .pipe(small2x())
    .pipe(parallel($.imageResize(resize(1160, 800)), cpus))
    .pipe(write())
    .pipe(parallel($.imageResize(resize(580, 400)), cpus));

  return merge([big, medium, small])
    .pipe(gulp.dest(processDst));
});

////////
// PROJECT(S)
////////

var projectDst = `${dst}/project`;
var projectSrc = lazypipe()
  .pipe(gulp.src, [`${src}/project/**/*.{jpg,JPG}`, `!${src}/project/**/*-cover.{jpg,JPG}`], {base: `${src}/project`})
  .pipe(normalizeExt);

gulp.task('clean-project', function(cb) {
  return del([projectDst], cb);
});

gulp.task('project', ['clean-project'], function () {
  var write = lazypipe()
  .pipe(gulp.dest, projectDst)
  .pipe(unRetina)

  return projectSrc()
    .pipe(retina())
    .pipe(parallel($.imageResize(resize(800, 600)), cpus))
    .pipe(write())
    .pipe(parallel($.imageResize(resize(400, 300)), cpus))
    .pipe(gulp.dest(projectDst))
});

