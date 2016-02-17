'use strict';

function home(req, res, next) {
  return res.render('home');
}

// process image counts are on
function proc(req, res, next) {
  return res.render('process', {
    steps: ['planning', 'construction', 'completion', 'interior'],
    imageCount: [5, 5, 11, 12],
  });
}
function faq(req, res, next) {
  return res.render('faq');
}

module.exports = {
  home:     home,
  proc:     proc,
  faq:      faq,
};
