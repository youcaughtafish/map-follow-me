var $ = require('jquery');
global.jQuery = $; 
require('bootstrap');

var mapboxgl = require('mapbox-gl');
var io = require('socket.io-client');
var url = require('url');

var parsedUrl = url.parse(window.location.href);

var users = {};

var sessionSocket = io('http://' + parsedUrl.host + parsedUrl.pathname);
sessionSocket.on('location update', function(msg) {
  console.log('heard location update: ' + JSON.stringify(msg));

  if (users.hasOwnProperty(msg.user.id)) {
    var user = users[msg.user.id];
    user.point.coordinates = msg.lngLat;
    user.source.setData(user.point);
    
  } else {
    var userPoint = {
      "type": "Point",
      "coordinates": msg.lngLat
    };

    users[msg.user.id] = {
      point: userPoint,
      source: new mapboxgl.GeoJSONSource({
        data: userPoint
      })
    };

    map.addSource(msg.user.id, users[msg.user.id].source);

    map.addLayer({
      "id": msg.user.id,
      "type": "symbol",
      "source": msg.user.id,
      "layout": {
        "icon-image": "car-24",
      }
    });
  }

});

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

map.on('style-load', function() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) { 
      console.log(JSON.stringify(position.coords.latitude +', ' +position.coords.longitude)); 
      map.flyTo({
        center: [ position.coords.longitude, position.coords.latitude ],
        zoom: 13
      });
    });
  }

});

$('#share-location-menu-item').on('click', function() {
  if (periodicPositionId) {
    window.clearInterval(periodicPositionId);

    $menuItem.text($menuItem.text().substring(2));

    periodicPositionId = 0;

  } else {
    periodicPositionId = window.setInterval(function() {
      navigator.geolocation.getCurrentPosition(function(position) { 
        var locationUpdateMsg = { 
          user: { id: sessionSocket.id },
          lngLat: [ position.coords.longitude, position.coords.latitude ] 
        };

        console.log('emmitting location update: ' + JSON.stringify(locationUpdateMsg));
        sessionSocket.emit('location update', locationUpdateMsg);
      });
    }, 1000);

    var menuItemTxt = $menuItem.text();
    $menuItem.text('✓ ' + menuItemTxt);
  }
});