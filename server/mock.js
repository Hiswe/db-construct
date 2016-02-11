'use strict';

var path    = require('path');
var gm      = require('gm');

var config  = require('./config');

if (config.isProd) {
  gm = gm.subClass({imageMagick: true})
}

function image(req, res, next) {
  var dimensions  = req.params.dimensions.split('x');
  var width       = dimensions[0];
  var height      = dimensions[1];

  var out = gm(width, height, '#707070');
  res.set('Content-Type', 'image/png');
  var x = 0, y = 0;
  var size = 40;
  // stripes
  while (y < height) {
      out = out
        .fill('#808080')
        .drawPolygon([x, y], [x + size, y], [x + size*2, y + size], [x + size*2, y + size*2])
        .drawPolygon([x, y + size], [x + size, y + size*2], [x, y + size*2]);
      x = x + size*2;
      if (x > width) { x = 0; y = y + size*2; }
  }
  // text
  out = out.fill('#CCCCCC')
    .drawText(0, 0, width + ' x ' + height, 'center')
    .font(path.join(__dirname, '../public/assets/Roboto-normal-900.woff'))
    .fontSize(20);
  return out.stream('png').pipe(res);

}

module.exports = {image};
