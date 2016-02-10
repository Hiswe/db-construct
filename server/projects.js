'use strict';

var projectsDb = require('./projects-database.js');

function project(req, res, next) {
  var name = req.params.name;
  // v8 in node v5 doesn't support yet Array.prototype.includes()
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

module.exports = {
  one: project,
  all: projects,
}
