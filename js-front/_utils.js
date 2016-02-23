
function $(selector, context = document) {
  return context.querySelector(selector);
}

function $$(selector, context = document) {
  return [...context.querySelectorAll(selector)];
}

function parseHTML(str) {
  var tmp = document.implementation.createHTMLDocument();
  tmp.body.innerHTML = str;
  return tmp.body.children;
};

function addClass(el, className) {
  el.classList ? el.classList.add(className) : el.className += ' ' + className;
}

function removeClass(el, className) {
  if (el.classList) {
    el.classList.remove(className);
  } else {
    let classNames = className.split(' ').join('|');
    // let classNames = new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi');
    classNames = new RegExp(`(^|\\b)${classNames}(\\b|$)`, 'gi');
    el.className = el.className.replace(classNames, ' ');
  }
}

// Has to create SVG in SVG namespace ¬_¬'
function svgIcon(name) {
  var svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute('role', 'img');
  svg.setAttribute('class', `icon icon-${name}`);
  var use = document.createElementNS("http://www.w3.org/2000/svg","use");
  use.setAttributeNS("http://www.w3.org/1999/xlink","xlmns:xlink","http://www.w3.org/1999/xlink");
  use.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",`/svg-symbols.svg#icon-${name}`);
  svg.appendChild(use);
  return svg;
}

function ready(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

export {$, $$, parseHTML, ready, svgIcon, addClass, removeClass};
