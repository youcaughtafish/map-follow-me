'use strict';

var io = require('socket.io-client');

var MapComm = module.exports = function(params) {
  this._url = params.url;
  this._sessionSocket = io(this._url);
  this._sessionId = params.sessionId;

  this._sessionSocket.on('locationUpdate', function(msg) {
    console.log('heard location update: ' + JSON.stringify(msg));
    if (params.isNewUser && params.onNewUser && params.isNewUser(msg)) {
      params.onNewUser(msg);
    }

    if (params.onLocationUpdate) {
      params.onLocationUpdate(msg);
    }
  });

  this._sessionSocket.on('userDisconnect', function(msg) {
    console.log('heard client disconnect: ' + JSON.stringify(msg));

    if (params.onUserDisconnect) {
      params.onUserDisconnect(msg);
    }
  });
};

MapComm.prototype.getUserId = function getUserId() {
  return this._sessionSocket.id;
};

MapComm.prototype.updateLocation = function(params) {
  var msg = { 
    session: { id: this._sessionId },
    user: { id: this._sessionSocket.id },
    lngLat: params.lngLat
  };

  console.log('emmitting location update: ' + JSON.stringify(msg));

  this._sessionSocket.emit('locationUpdate', msg);
};

MapComm.prototype.stopBroadcasting = function() {
   var msg = { 
    session: { id: this._sessionId },
    user: { id: this._sessionSocket.id },
    removeFromMap: true
  };

  this._sessionSocket.emit('locationUpdate', msg);
};



