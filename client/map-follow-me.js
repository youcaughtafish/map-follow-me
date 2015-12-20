'use strict';

var $ = require('jquery');
global.jQuery = $; 
require('bootstrap');

var url = require('url');
var geo = require('./geolocation');
var Map = require('./map');
var MapComm = require('./map-comm');

var map = new Map(
  {
    accessToken: 'pk.eyJ1IjoiZHptb29yZSIsImEiOiJjYVZtSW1FIn0.5MByMdfHMEp0QV6beF5UgQ',
    mapStyle: 'mapbox://styles/dzmoore/ciht76il500co95ly1m27njba'
  }, 
  function onLoad() {
    geo.getCurrentPosition(function getPosition(position) {
      this.flyTo({
        center: [ position.coords.longitude, position.coords.latitude ],
        zoom: 13
      });
    }.bind(this));
  }
);

var parsedUrl = url.parse(window.location.href);
var sessionId = parsedUrl.pathname;
var users = {};

function isExistingUser(id) {
  return users.hasOwnProperty(id);
}

function removeFromMap(id) {
  map.removeFromMap(id);
  delete users[id];
}

var mapComm = new MapComm({
  url: 'http://' + parsedUrl.host + parsedUrl.pathname,

  sessionId: sessionId,

  onNewUser: function onNewUser(msg) {
    var userId = msg.user.id;
    users[userId] = map.addToMap({
      id: userId,
      lngLat: msg.lngLat
    });
  },

  isNewUser: function isNewUser(msg) {
    return !!msg && !!msg.user.id && !isExistingUser(msg.user.id);
  },

  onLocationUpdate: function onLocationUpdate(msg) {
    if (msg.hasOwnProperty('removeFromMap')) {
      removeFromMap(msg.user.id);

    } else {
      map.updateItemLocation({
        lngLat: msg.lngLat,
        itemData: users[msg.user.id]
      });
    }
  },

  onUserDisconnect: function onUserDisconnect(msg) {
    map.removeFromMap(msg.user.id);
  }
});

var positionWatchId = 0;
var $broadcastMenuItem = $('#broadcast-location-menu-item');
var $shareMenuItem = $('#share-location-menu-item');

$shareMenuItem.on('click', function() {

});

$broadcastMenuItem.on('click', function() {
  if (positionWatchId) {
    geo.clearWatch(positionWatchId);

    $broadcastMenuItem.text($broadcastMenuItem.text().substring(2));

    positionWatchId = 0;

    mapComm.stopBroadcasting();

  } else {
    positionWatchId = geo.watchPosition(function watchPosition(position) { 
      var lngLat = [ position.coords.longitude, position.coords.latitude ];

      mapComm.updateLocation({ lngLat: lngLat });
    });

    var menuItemTxt = $broadcastMenuItem.text();
    $broadcastMenuItem.text('✓ ' + menuItemTxt);
  }
});