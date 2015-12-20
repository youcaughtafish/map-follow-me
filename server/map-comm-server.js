'use strict';

var http = require('http');
var socketIo = require('socket.io');

var MapCommServer = module.exports = function MapCommServer(params) {
  this._sessions = {};
  this._app = params.app;
  this.server = http.Server(this._app);
  this._io = socketIo(this.server);
};

MapCommServer.prototype.onSession = function onSession(session) {
  var sessionId = session.id;

  console.log('establishing session: ' + JSON.stringify(session));
  if (this._sessions.hasOwnProperty(sessionId)) {
    this._sessions[sessionId]++;

  } else {
    this._sessions[sessionId] = 1
  
    var ioSession = this._io.of(sessionId);
    ioSession.on('connection', function(sessionSocket) {
      var sessionSocketId = sessionSocket.id;

      console.log('session established: session: ' + sessionId + '; socket: ' + sessionSocket.id);

      sessionSocket.on('locationUpdate', function(msg) {
        console.log('session: ' + sessionId + '; sessionSocketId: ' + 
          sessionSocketId + '; location update: ' + JSON.stringify(msg));

        ioSession.emit('locationUpdate', msg);
      }.bind(this));

      sessionSocket.on('userDisconnect', function() {
        console.log('socket: ' + sessionSocketId + ' disconnecting from session: ' + JSON.stringify(session));
        if (--this._sessions[sessionId]) {
          var clientDisconnectMsg = { 
            client: { id: sessionSocketId },
            session: { id: sessionId }
          };

          console.log('emitting client disconnect: ' + JSON.stringify(clientDisconnectMsg));
          
          ioSession.emit('userDisconnect', clientDisconnectMsg);
        }
      }.bind(this));
    }.bind(this));
  }
};
