'use strict';

var projectsDb = require('./projects-database.js');

function project(req, res, next) {
  var name  = req.params.name;
  var index = projectsDb.whiteList.indexOf(name);
  // v8 in node v5 doesn't support yet Array.prototype.includes()
  if (index === -1) {
    res.status(404);
    next();
  };
  return res.render('project', {
    project: projectsDb.projects[index],
  });
}
function projects(req, res, next) {
  return res.render('projects', {
    projects: projectsDb.projects,
  });
}

module.exports = {
  one: project,
  all: projects,
}
