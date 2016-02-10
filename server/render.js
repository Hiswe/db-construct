'use strict';

function home(req, res, next) {
  return res.render('home');
}

function proc(req, res, next) {
  return res.render('process');
}
function faq(req, res, next) {
  return res.render('faq');
}

module.exports = {
  home:     home,
  proc:     proc,
  faq:      faq,
};
