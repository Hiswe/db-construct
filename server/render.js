'use strict';

var projectsDb = require('./projects-database.js');

function home(req, res, next) {
  return res.render('home');
}

function project(req, res, next) {
  var name = req.params.name;
  // v8 doesn't support yet Array.prototype.includes()
  if (projectsDb.indexOf(name) === -1) {
    res.status(404);
    next();
  };
  return res.render('project', {
    project: name,
  });
}
function projects(req, res, next) {
  return res.render('projects', {
    projects: projectsDb,
  });
}
function proc(req, res, next) {
  return res.render('process');
}
function faq(req, res, next) {
  return res.render('faq');
}
function contact(req, res, next) {
  return res.render('contact');
}

module.exports = {
  home:     home,
  projects: projects,
  proc:     proc,
  faq:      faq,
  contact:  contact,
  project:  project,
};
