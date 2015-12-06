var $ = require('jquery');
global.jQuery = $; 
require('bootstrap');

var mapboxgl = require('mapbox-gl');
var io = require('socket.io-client');
var socket = io('http://localhost:3000');

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
  navigator.geolocation.getCurrentPosition(function(position) { 
    console.log('emitting location update');
    socket.emit('location update', { lngLat: [ position.coords.longitude, position.coords.latitude ] });
  });
});

map.on('load', function() {
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
        socket.emit('location update', {lngLat: [ position.coords.longitude, position.coords.latitude ] });
      });
    }, 1000);

    var menuItemTxt = $menuItem.text();
    $menuItem.text('✓ ' + menuItemTxt);
  }
});