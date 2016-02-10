'use strict';

function home(req, res, next) {
  return res.render('home');
}

module.exports = {
  home:   home,
};
