import poser from 'poser'

var _dom  = poser.Array();

var method = _dom.prototype;

// CLASSES
var whitespace = /\s+/g;

function cleanClasses(classNames) {
  return classNames.trim().replace(whitespace, ' ').split(' ');
}

function addClass(el, classNames) {
  classNames = cleanClasses(classNames);
  classNames.forEach( className => el.classList.add(className));
}

function removeClass(el, classNames) {
  classNames = cleanClasses(classNames);
  classNames.forEach( className => el.classList.remove(className));
}

method.addClass = function (classNames) {
  this.forEach(el => addClass(el, classNames));
  return this;
}

method.removeClass = function (classNames) {
  this.forEach(el => removeClass(el, classNames));
  return this;
}

method.hasClass = function hasClass(className) {
  let el = this[0];
  if (!el) return false;
  return el.classList.contains(className);
}


// DOM

// TODO should handle SVG ¬_¬'
function parseHTML(str) {
  var tmp = document.implementation.createHTMLDocument();
  tmp.body.innerHTML = str;
  return tmp.body.children;
};

function appendChild(el, childrens) {
  childrens = $(childrens);
  childrens.forEach(child => el.appendChild(child));
}

method.append = function append(childrens) {
  this.forEach( el => appendChild(el, childrens));
  return this;
};

function removeSelf(el) {
  el.parentNode.removeChild(el);
}

method.remove = function remove() {
  this.forEach(removeSelf);
  return this;
}

function find(el, selector) {
  return $(selector, el);
}

method.find = function (selector) {
  var result = [];
  this.forEach( el => result.push(...find(el, selector)));
  return new _dom(...result);
}

function setHtml(el, content) {
  el.innerHTML = content;
}

method.html = function html(content) {
  this.forEach(el => setHtml(el, content));
  return this;
}

function getAttr(el, attrName) {
  if (!el) return '';
  if (!el.hasAttribute(attrName)) return '';
  return el.getAttribute(attrName);
}
function setAttr(e, attrName, attrContent) {
  return el.setAttribute(attrName, attrContent);
}

method.attr = function (attrName, attrContent = false) {
  if (!attrContent) return getAttr(this[0], attrName, attrContent);
  this.forEach(el => setAttribute(el, attrName, attrContent));
  return this;
}

function setCss(el, property, value) {
  el.style[property] = value;
}

function getCss(el, property) {
  return '';
}

method.css = function css(property, value) {
  if (!value) return getCss();
  this.forEach(el => setCss(el, property, value));
  return this;
}

// EVENTS

function on(el, event, cb) {
  el.addEventListener(event, cb);
}

method.on = function (event, cb) {
  this.forEach(el => on(el, event, cb));
  return this;
}

// CONSTRUCTOR

function isInstance(el) {
  return el instanceof _dom;
}

function isDom(el) {
  if (typeof el !== 'object') return false;
  return 'nodeName' in el;
}

function $(selector, context = document) {
  // already an instance
  if (isInstance(selector)) return selector;
  // dom object
  if (isDom(selector)) return new _dom(selector);
  // dom creation
  if (/</.test(selector)) return new _dom(...parseHTML(selector));
  // selector
  return new _dom(...context.querySelectorAll(selector));
}

export {$ as default};
