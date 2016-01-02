'use strict';

var $ = require('jquery');
global.jQuery = $; 
require('bootstrap');

var url = require('url');
var geo = require('./geolocation');
var Map = require('./map');
var MapComm = require('./map-comm');
var ReactDOM = require('react-dom');
var React = require('react');
var PopupMenu = require('./views/index.jsx');

var parsedUrl = url.parse(window.location.href, true);
var sessionId = parsedUrl.pathname;
var urlQueryMap = parsedUrl.query;

var positionWatchId = 0;
var followId = urlQueryMap.following ? parsedUrl.query.following : '';

var dummyMovementId = 0;
var dummyMovement = parsedUrl.query.dummyMovement;
var dummyMovementFactor = -0.0000134;
var dummyMovementLngLat;

var users = {};

var menuItems = [
  { 
    menuItemId: 'broadcast-location-menu-item',
    menuItemTitle: 'Broadcast Location',
    initiallyChecked: false,
    onClick: handleBroadcastLocationToggle
  },
  { 
    menuItemId: 'follow-location-menu-item',
    menuItemTitle: 'Follow Location',
    initiallyChecked: !!followId,
    onClick: handleFollowLocationToggle
  }
];

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

      if (followId && followId === msg.user.id) {
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

function writeUrlQuery() {
  var newQueryString = '?';
  Object.keys(urlQueryMap).forEach(function(key, i) {
    if (i > 0) newQueryString += '&';

    newQueryString += encodeURIComponent(key) + '=' + encodeURIComponent(urlQueryMap[key]);
  });

  window.history.pushState(null, null, newQueryString);
}

function addFollowingToUrl() {
  urlQueryMap.following = mapComm.getUserId();
  writeUrlQuery();
}

function removeFollowingFromUrl() {
  if ('following' in urlQueryMap) {
    delete urlQueryMap.following;
    writeUrlQuery();
  }
}

function handleBroadcastLocationToggle(checked) {
  if (checked) {

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

  } else {
    if (dummyMovement) {
      clearInterval(dummyMovementId);
      dummyMovementId = 0;

    } else {
      geo.clearWatch(positionWatchId);

      positionWatchId = 0;
    }

    mapComm.stopBroadcasting();
  }
}

function handleFollowLocationToggle(checked) {
  if (checked) {
    /* if we're not already following from the url */
    if (!followId) {
      followId = mapComm.getUserId();
      addFollowingToUrl();
    }

  } else {
    followId = '';
    removeFollowingFromUrl();
  }
}

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

function isExistingUser(id) {
  return users.hasOwnProperty(id);
}

function removeFromMap(id) {
  map.removeFromMap(id);
  delete users[id];
}


ReactDOM.render(
  <PopupMenu 
    menuId='nav-container' 
    popupMenuBtnId='menu-btn' 
    menuItems={menuItems} 
    checkmark='✓ '/>,
  document.getElementById('nav-outer-container')
);

