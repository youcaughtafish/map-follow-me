var $ = require('jquery');
global.jQuery = $; 
require('bootstrap');

var mapboxgl = require('mapbox-gl');
var io = require('socket.io-client');
var url = require('url');

var parsedUrl = url.parse(window.location.href);

var sessionId = parsedUrl.pathname;

var clientSessions = {};

var sessionSocket = io('http://' + parsedUrl.host + parsedUrl.pathname);
sessionSocket.on('location update', function(msg) {
  console.log('heard location update: ' + JSON.stringify(msg));

  if (clientSessions.hasOwnProperty(msg.client.id)) {
    if (msg.hasOwnProperty('removeFromMap')) {
      removeClientFromMap(msg.client);

    } else {
      var clientSession = clientSessions[msg.client.id];
      clientSession.point.coordinates = msg.lngLat;
      clientSession.source.setData(clientSession.point);
    }
    
  } else {
    var clientSessionPoint = {
      "type": "Point",
      "coordinates": msg.lngLat
    };

    clientSessions[msg.client.id] = {
      point: clientSessionPoint,
      source: new mapboxgl.GeoJSONSource({
        data: clientSessionPoint
      })
    };

    map.addSource(msg.client.id, clientSessions[msg.client.id].source);

    map.addLayer({
      "id": msg.client.id,
      "type": "symbol",
      "source": msg.client.id,
      "layout": {
        "icon-image": "car-24",
      }
    });
  }
});

sessionSocket.on('client disconnect', function(msg) {
  console.log('heard client disconnect: ' + JSON.stringify(msg));

  removeClientFromMap(msg.client);
});

function removeClientFromMap(client) {
  if (clientSessions.hasOwnProperty(client.id)) {
    map.removeLayer(client.id);
    map.removeSource(client.id);
    delete clientSessions[client.id];
  }
}

var periodicPositionId = 0;
var $menuItem = $('#share-location-menu-item');

mapboxgl.accessToken = 'pk.eyJ1IjoiZHptb29yZSIsImEiOiJjYVZtSW1FIn0.5MByMdfHMEp0QV6beF5UgQ';
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/dzmoore/ciht76il500co95ly1m27njba', //stylesheet location
  center: [0,0], // starting position
  zoom: 1 // starting zoom

}).on('movestart', function() {
  console.log('map.movestart');

}).on('moveend', function(e) {
  console.log('map.moveend');
});

map.on('load', function() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) { 
      console.log(JSON.stringify(position.coords.latitude +', ' +position.coords.longitude)); 
      map.flyTo({
        center: [ position.coords.longitude, position.coords.latitude ],
        zoom: 13
      });
    }, function() {}, { enableHighAccuracy: true });
  }
});

$('#share-location-menu-item').on('click', function() {
  var locationUpdateMsg = { 
    session: { id: sessionId },
    client: { id: sessionSocket.id }
  };

  if (periodicPositionId) {
    window.clearInterval(periodicPositionId);

    $menuItem.text($menuItem.text().substring(2));

    periodicPositionId = 0;

    locationUpdateMsg.removeFromMap = true;
    sessionSocket.emit('location update', locationUpdateMsg);

  } else {
    periodicPositionId = window.setInterval(function() {
      navigator.geolocation.getCurrentPosition(function(position) { 
        locationUpdateMsg.lngLat =
          [ position.coords.longitude, position.coords.latitude ];

        console.log('emmitting location update: ' + JSON.stringify(locationUpdateMsg));

        sessionSocket.emit('location update', locationUpdateMsg);
      });
    }, 3000);

    var menuItemTxt = $menuItem.text();
    $menuItem.text('✓ ' + menuItemTxt);
  }
});