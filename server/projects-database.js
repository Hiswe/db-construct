'use strict';

var projects = [{
    name: 'residence-mae-rim',
    images: 15
  }, {
    name: 'residence-paa-phai',
    images: 15
  }, {
    name: 'residence-san-sai',
    images: 15
  }, {
    name: 'home-office-mae-rim',
    images: 15
  },
];

module.exports = {
  projects: projects,
  whiteList: projects.map(project => project.name),
};
