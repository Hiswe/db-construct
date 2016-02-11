// meant to be used with ES2015
// https://nodejs.org/en/docs/es6/
// still need the 'use strict' with v8

'use strict';

var path          = require('path');
var chalk         = require('chalk');
var express       = require('express');
var bodyParser    = require('body-parser');
var compression   = require('compression');
var morgan        = require('morgan');
var favicon       = require('serve-favicon');
var errorHandler  = require('express-error-handler');
var cookieParser  = require('cookie-parser');
var i18n          = require('i18n');
var flash         = require('express-flash');
var session       = require('express-session');

var config        = require('./server/config');

//////
// SERVER CONFIG
//////

var app = express();

// configure i18n
i18n.configure({
  locales:        ['en', 'th',],
  defaultLocale:  'en',
  extension:      '.js',
  cookie:         'dbconstruct',
  objectNotation: true,
  directory:      path.join( __dirname, './server/locales'),
});

app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  limit: '5mb',
  extended: true
}));
app.use(compression());
app.use(favicon(path.join(__dirname, '/favicon.png')));

var cookieSecret = 'keyboard cat';

app.use(cookieParser(cookieSecret));
// https://www.npmjs.com/package/express-session#cookie-options
app.use(session({
  secret: cookieSecret,
  resave: false,
  saveUninitialized: true,
}));
app.use(flash());
app.use(i18n.init);


//----- TEMPLATES

app.set('views', path.join(__dirname, './server/views'));
app.set('view engine', 'jade');

//----- STATIC

// compiled assets
app.use(express.static('./dist'));

// commited assets
app.use(express.static('./public'));

// placeholder mocking
var mock      = require('./server/mock');

app.get('/image/:dimensions', mock.image);

//////
// LOGGING
//////

function logRequest(tokens, req, res) {
  var method  = tokens.method(req, res);
  var url     = tokens.url(req, res);
  return chalk.blue(method) + ' ' + chalk.grey(url);
}

function logResponse(tokens, req, res) {
  var method      = tokens.method(req, res);
  var status      = tokens.status(req, res);
  var url         = tokens.url(req, res);
  var statusColor = status >= 500
    ? 'red' : status >= 400
    ? 'yellow' : status >= 300
    ? 'cyan' : 'green';
  return chalk.blue(method) + ' '
    + chalk.grey(url) + ' '
    + chalk[statusColor](status);
}
app.use(morgan(logRequest, {immediate: true}));
app.use(morgan(logResponse));

//////
// ROUTING
//////

var render    = require('./server/render');
var contact   = require('./server/contact');
var projects  = require('./server/projects');

// take care of language query params
app.use(function(req, res, next) {
  if (req.query.lang) {
    res.cookie('dbconstruct', req.query.lang, { maxAge: 900000, httpOnly: true });
    res.setLocale(req.query.lang);
    // need this for first query good rendering…
    res.locals.locale = req.query.lang;
  };
  next();
});


// add page class name
app.get('*', function (req, res, next) {
  var path = req.path;
  var name = path === '/' ? 'home' : /\/([^/]*).*/.exec(path)[1];
  res.locals.pageName = name;
  next();
});

app.get('/project/:name',     projects.one);
app.get('/projects',          projects.all);

app.get('/contact',           contact.get);
app.post('/contact',          contact.post);

app.get('/process',           render.proc);
app.get('/faq',               render.faq);
app.get('/',                  render.home);

//////
// ERROR HANDLING
//////

var handler = errorHandler({
  views: {
  //   default:  'error/default',
    404:      'error/404',
  },
});
app.use(function (err, req, res, next) {
  console.log(err);
  // force status for morgan to catch up
  res.status(err.status || err.statusCode);
  next(err);
});

app.use(errorHandler.httpError(404));
app.use(handler);

//////
// LAUNCHING
//////

var server = app.listen(config.PORT, function endInit() {
  console.log(
    chalk.green('Server is listening on port'), chalk.cyan(server.address().port),
    chalk.green('on mode'), chalk.cyan(config.NODE_ENV)
  );
});
