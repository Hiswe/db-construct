'use strict';

var _               = require('lodash');
var fs              = require('fs');
var del             = require('del');
var gulp            = require('gulp');
var $               = require('gulp-load-plugins')();
var merge           = require('merge-stream');
var browserSync     = require('browser-sync').create();
var reload          = browserSync.reload;
var args            = require('yargs').argv;
var cyan            = require('chalk').cyan;
var os              = require('os');
var cpus            = os.cpus().length;

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
var cssurl        = require('postcss-url');
// var pxtorem       = require('postcss-pxtorem');

gulp.task('css', function () {
  return gulp
    .src(['styl/db-construct.styl', 'styl/db-construct-ie.styl'])
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
          browsers: ['> 1%', 'IE 9', 'IE 10', 'IE 11', 'last 2 versions'],
        }),
        cssurl({
          url: 'inline',
          maxSize: 15,
          basePath: __dirname + '/public',
        }),
        // pxtorem({replace: true}),
      ]))
    .pipe($.if(!isDev, $.uglifycss()))
    .pipe($.if(isDev, $.sourcemaps.write()))
    .pipe(gulp.dest('public'))
    .pipe(reload({stream: true}));
});

////////
// JS
////////

var browserify    = require('browserify');
var babelify      = require('babelify');
var jadeify       = require('jadeify');
var envify        = require('envify/custom');
var vinylBuffer   = require('vinyl-buffer');
var source        = require('vinyl-source-stream');
var watchify      = require('watchify');

//----- LIBRARIES

gulp.task('libraries-ie', function () {
  gulp.src([
    'node_modules/html5shiv/dist/html5shiv.min.js',
    'node_modules/svg4everybody/dist/svg4everybody.legacy.min.js',
    'node_modules/lazysizes/lazysizes.min.js',
  ])
  .pipe($.concat('libraries-ie.js'))
  .pipe(gulp.dest('public'));
});

//----- APPLICATION

gulp.task('app', function () {
  var b = browserify({
    cache:        {},
    packageCache: {},
    debug:        true,
    entries:      ['./js-front/index.js']
  });

  b.transform(babelify, {presets: ['es2015']})
  // can't compile mixins
  // https://github.com/jadejs/jade/issues/1950
  b.transform(jadeify, { compileDebug: isDev, pretty: isDev });

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
    .on('error', onError)
    .pipe(source('db-construct.js'))
    .pipe(vinylBuffer())
    .pipe($.if(!isDev, $.uglify()))
    .pipe(gulp.dest('public'))
}

//----- ALL JS

gulp.task('js', ['app', 'libraries-ie']);

////////
// ASSETS
////////

//----- PIXEL IMAGES

require('./gulpfile-image.js');

//----- SVG IMAGES

gulp.task('svg-images', function () {
  return gulp
    .src('public/assets/*.svg')
    // need gulp-cheerio for
    // https://github.com/Hiswe/gulp-svg-symbols/issues/24
    .pipe($.cheerio({
      run: function ($, file) {
        $('svg').each(function () {
          $(this).attr('width', null);
          $(this).attr('height', null);
        });
      },
       parserOptions: {
        xmlMode: true
      }
    }))
    .pipe($.svgSymbols({
      id: 'svg-%f',
      className: '.svg-%f',
    }))
    .pipe($.rename({basename: 'svg-images'}))
    .pipe($.if( /[.]svg$/, gulp.dest('public')))
    .pipe($.if( /[.]css$/, gulp.dest('styl')));
});

//----- SVG ICONS

gulp.task('icons', function () {
  return gulp
    .src('public/icons/*.svg')
    .pipe($.svgmin({ plugins: [
      { removeUselessDefs: false },
      { cleanupIDs: false },
      { removeAttrs: { attrs: ['fill', 'stroke'] } },
    ]}))
    .pipe($.svgSymbols({
      id: 'icon-%f',
      className: '.icon-%f',
    }))
    .pipe($.if( /[.]svg$/, gulp.dest('public')))
    .pipe($.if( /[.]css$/, gulp.dest('styl')));
});

//----- SVG ASSETS FALLBACK

// need to set proper sizes…
gulp.task('prepare-svg-fallback', function () {
  return gulp
    .src(['public/assets/*.svg', 'public/icons/*.svg', '!public/icons/drop-shadow.svg'])
    .pipe($.cheerio({
      run: function ($, file) {
        $('svg').each(function () {
          let width = $(this).attr('width')
          if (width !== '100%') return;
          let viewbox = $(this).attr('viewBox').split(' ');
          $(this).attr('width', viewbox[2] + 'px');
          $(this).attr('height', viewbox[3] + 'px');
        });
      },
       parserOptions: {
        xmlMode: true
      }
    }))
    .pipe(gulp.dest('tmp'));
})

gulp.task('svg-fallback', ['prepare-svg-fallback'], function () {
  return gulp
    .src(['tmp/*.svg'])
    // https://www.npmjs.com/package/gulp-svg2png#svg2pngscaling-verbose-concurrency
    .pipe($.svg2png(1, false, cpus))
    .pipe(gulp.dest('public/fallback'));
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

//----- APP-CACHE MANIFEST

// Deprecated http://caniuse.com/#feat=offline-apps
// should switch to service workers
// as it needs an https connection won't do it for this simple website
// https://ponyfoo.com/articles/simple-offline-site-serviceworker
gulp.task('manifest', function(){
  return gulp.src([
      'public/*.css',
      '!public/*-ie.css',
      'public/*.js',
      '!public/*-ie.js',
      'public/svg-*.svg',
      'public/*.png',
    ])
    .pipe($.manifest({
      // hash: true,
      timestamp: true,
      preferOnline: true,
      network: ['http://*', 'https://*', '*'],
      filename: 'cache.manifest',
      exclude: 'cache.manifest'
     }))
    .pipe(gulp.dest('public'))
});

//----- RENDER MAIL

gulp.task('mail', function() {
  var mailSrc = 'server/views/mail*.jade';
  var dico = {
    en: JSON.parse(fs.readFileSync(__dirname + '/server/locales/en.js')),
    th: JSON.parse(fs.readFileSync(__dirname + '/server/locales/th.js')),
  };
  // I18N should handle this
  // https://www.npmjs.com/package/i18n#some-words-on-register-option
  function getParams(lang) {
    return {
      // pretty: isDev,
      locals: {
        bg: '#302D2C',
        primary: '#2A5D61',
        accent: '#F5A956',
        // isStatic: true,
        // revisions: revisions,
        getLocale: function () { return lang; },
        __: function (key) {
          var current = dico[lang];
          if (!/\./.test(key)) return current[key]
          key = key.split('.');
          var result = current;
          key.forEach(function (part) {
            result = result[part];
          })
          return result;
        }
      },
    };
  }

  var en =  gulp
    .src(mailSrc)
    .pipe($.jade(getParams('en')))
    .pipe($.rename({suffix: '-en'}))

  var th =  gulp
    .src(mailSrc)
    .pipe($.jade(getParams('th')))
    .pipe($.rename({suffix: '-th'}))

  return merge(en, th)
    .pipe($.replace('<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">', ''))
    .pipe(gulp.dest('public'))
    .pipe($.headerFooter({
      header: `
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  </head>
  <body>`,
      footer: `</body></html>`,
      filter: function (file){ return true; }
    }))
    .pipe($.htmlPrettify({indent_char: ' ', indent_size: 2}))
    .pipe(gulp.dest('tmp'))
});

//----- ALL ASSETS

gulp.task('svg',    ['icons', 'svg-images']);
// gulp.task('assets', ['icons', 'svg-images', 'fonts', 'mail']);
gulp.task('assets', ['icons', 'svg-images', 'manifest', 'mail']);

////////
// DEV
////////

//----- SERVER

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
    ghostMode: {
      clicks: true,
      forms:  false,
      scroll: false
    },
  });
});

gulp.task('watch', ['browser-sync', 'js'], function () {
  gulp.watch(['server/views/**/mail-*.jade',
              'server/views/**/_mail-*.jade'], ['mail']);
  // !! don't put ./ before path
  // http://stackoverflow.com/questions/22391527/gulps-gulp-watch-not-triggered-for-new-or-deleted-files
  gulp.watch(['styl/**/*.styl',
              'styl/**/*.css'],  ['css']);
  gulp.watch(['public/*.js']).on('change', reload);
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

gulp.task('build', ['assets', 'js', 'css']);
