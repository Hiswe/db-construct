'use strict';

var projectsDb = require('./projects-database.js');

function project(req, res, next) {
  var name  = req.params.name;
  var index = projectsDb.whiteList.indexOf(name);
  if (index === -1) {
    res.status(404);
    next();
  };
  return res.render('project', {
    project: projectsDb.projects[index],
  });
}
function projects(req, res, next) {
  return res.render('project-list', {
    projects: projectsDb.projects,
  });
}

module.exports = {
  one: project,
  all: projects,
}
