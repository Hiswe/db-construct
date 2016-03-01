import poser from 'poser'

const _dom    = poser.Array();
const method  = _dom.prototype;

//////
// ATTRIBUTES / CSS
//////

//----- Attributes

const whitespace = /\s+/g;

function cleanClasses(classNames) {
  return classNames.trim().replace(whitespace, ' ').split(' ');
}

function domAddClass(el, classNames) {
  classNames = cleanClasses(classNames);
  classNames.forEach( className => el.classList.add(className));
}

method.addClass = function addClass(classNames) {
  this.forEach(el => domAddClass(el, classNames));
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

method.attr = function attr(attrName, attrContent = false) {
  if (!attrContent) return getAttr(this[0], attrName, attrContent);
  this.forEach(el => setAttribute(el, attrName, attrContent));
  return this;
}

method.hasClass = function hasClass(className) {
  let el = this[0];
  if (!el) return false;
  return el.classList.contains(className);
}

function domRemoveClass(el, classNames) {
  classNames = cleanClasses(classNames);
  classNames.forEach( className => el.classList.remove(className));
}

method.removeClass = function removeClass(classNames) {
  this.forEach(el => domRemoveClass(el, classNames));
  return this;
}

//----- CSS

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

//////
// MANIPULATION
//////

//----- DOM Insertion, Inside

function appendChild(el, childrens) {
  childrens = $(childrens);
  childrens.forEach(child => el.appendChild(child));
}

method.append = function append(childrens) {
  this.forEach( el => appendChild(el, childrens));
  return this;
};

function setHtml(el, content) {
  el.innerHTML = content;
}

method.html = function html(content) {
  this.forEach(el => setHtml(el, content));
  return this;
}

//----- DOM Removal

function removeSelf(el) {
  el.parentNode.removeChild(el);
}

method.remove = function remove() {
  this.forEach(removeSelf);
  return this;
}

//////
// TRAVERSING
//////

//----- TREE TRAVERSAL

function findEl(el, selector) {
  return $(selector, el);
}

method.find = function fin(selector) {
  var result = [];
  this.forEach( el => result.push(...findEl(el, selector)));
  return new _dom(...result);
}

function getParent(el) {
  return el.parentNode;
}

method.parent = function parent() {
  return new _dom(...this.map(getParent));
}

//////
// EVENTS
//////

//----- Event Handler Attachment

function addEvent(el, event, cb) {
  el.addEventListener(event, cb);
}

method.on = function (event, cb) {
  this.forEach(el => addEvent(el, event, cb));
  return this;
}

//////
// CONSTRUCTOR
//////

function isInstance(el) {
  return el instanceof _dom;
}

function isDom(el) {
  if (typeof el !== 'object') return false;
  return 'nodeName' in el;
}

// TODO should handle SVG ¬_¬'
function parseHTML(str) {
  var tmp = document.implementation.createHTMLDocument();
  tmp.body.innerHTML = str;
  return tmp.body.children;
};

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
