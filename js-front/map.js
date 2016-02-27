import logger from './_logger';
import * as utils from './_utils';

const log = logger('map', false);
const url =
`http://maps.googleapis.com/maps/api/js
?callback=window.dbConstruct.mapInit`;
var address;
var map;
var location;
var container;

function load() {
  container = utils.$('.js-map');
  if (!container) return log('abort');

  log('load gmap script...');
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;
  document.body.appendChild(script);
}

function mapInit() {
  log('initialize');

  // https://www.google.com/maps/@18.9018117,99.0655523,17z
  location  = new google.maps.LatLng(18.9018117, 99.0655523);
  address   = `<strong>D.B.&nbsp;Construct</strong>
  <br />
  ${utils.$('.js-address').innerHTML}`;

  log(utils.$('.js-address').innerHTML);

  map = new google.maps.Map(container, {
    zoom: 14,
    center: location,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  addMarker();
}

function addMarker() {
  log('add marker');
  var marker = new google.maps.Marker({
    // icon: 'http://maps.google.com/mapfiles/ms/icons/pink-dot.png',
    position: location,
    map: map,
  });
  log('add description');
  var descripion = new google.maps.InfoWindow({
    content: address
  });
  descripion.open(map, marker);
}

////////
// EXPORTS
////////

export {load as default, mapInit};
