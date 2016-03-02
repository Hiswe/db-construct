
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

function wait(duration = 1000) {
  return new Promise( (resolve, reject) => {setTimeout(resolve, duration )});
}

function ready(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

export {ready, svgIcon, wait};
