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

var parsedUrl = url.parse(window.location.href, true);
var sessionId = parsedUrl.pathname;
var followId = !!parsedUrl.query.following ? parsedUrl.query.following : '';
var dummyMovement = !!parsedUrl.query.dummyMovement;

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

      if (!!followId && followId === msg.user.id) {
        map.jumpTo({
          center: msg.lngLat,
          zoom: 16
        });
      }
    }
  },

  onUserDisconnect: function onUserDisconnect(msg) {
    map.removeFromMap(msg.user.id);
  }
});

var positionWatchId = 0;
var dummyMovementId = 0;
var dummyMovementLngLat;
var dummyMovementFactor = -0.0000134;

var $broadcastMenuItem = $('#broadcast-location-menu-item');
var $followMenuItem = $('#follow-location-menu-item');
var checkmarkPrefix = '✓ ';

if (!followId || followId !== mapComm.getUserId()) {
  $followMenuItem.hide();
  setAsNotFollowing();
}

function setAsFollowing() {
  var menuTxt = $followMenuItem.text();
  $followMenuItem.text(checkmarkPrefix + $followMenuItem.text());

  followId = mapComm.getUserId();
  window.history.pushState(null, 'following', '?following=' + followId);
}

function setAsNotFollowing() {
  var menuTxt = $followMenuItem.text();
  if (menuTxt.indexOf(checkmarkPrefix) >= 0) {
    $followMenuItem.text($followMenuItem.text().substring(checkmarkPrefix.length));
    followId = '';
    window.history.pushState(null, 'following', '?');
  }
}

$followMenuItem.on('click', function() {
  if (!!followId) {
    setAsNotFollowing();

  } else {
    setAsFollowing();
  }
});

$broadcastMenuItem.on('click', function() {
  if (positionWatchId || dummyMovementId) {
    $followMenuItem.hide();

    setAsNotFollowing();

    if (dummyMovement) {
      clearInterval(dummyMovementId);
      dummyMovementId = 0;

    } else {
      geo.clearWatch(positionWatchId);

      positionWatchId = 0;
    }

    mapComm.stopBroadcasting();
    $broadcastMenuItem.text($broadcastMenuItem.text().substring(checkmarkPrefix.length));


  } else {
    $followMenuItem.show();

    if (dummyMovement) {
      geo.getCurrentPosition(function getPosition(position) {
        dummyMovementLngLat = [ position.coords.longitude, position.coords.latitude ];

        dummyMovementId = setInterval(function() {
          dummyMovementLngLat = [ 
            dummyMovementLngLat[0] + (Math.random() * dummyMovementFactor) - dummyMovementFactor, 
            dummyMovementLngLat[1] + (Math.random() * dummyMovementFactor) - dummyMovementFactor 
          ];

          mapComm.updateLocation({ 
            lngLat: dummyMovementLngLat
          });
        }, 500);
      });

    } else {
      positionWatchId = geo.watchPosition(function watchPosition(position) { 
        var lngLat = [ position.coords.longitude, position.coords.latitude ];

        mapComm.updateLocation({ lngLat: lngLat });
      });
    }

    var menuItemTxt = $broadcastMenuItem.text();
    $broadcastMenuItem.text(checkmarkPrefix + menuItemTxt);
  }
});