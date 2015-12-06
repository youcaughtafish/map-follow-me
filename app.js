var express = require('express');
var router = express.Router();
var browserify = require('browserify');
var shortid = require('shortid');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

var sessions = {};

/* GET home page. */
router.get('/', function(req, res, next) {
  var sessionId = shortid.generate();
  console.log('redirecting to: /s/' + sessionId);
  res.redirect('/s/' + sessionId);
 });
 
router.get('/s/:sessionId', function(req, res, next) {
  var sessionId = req.params.sessionId;
  onSession({ id: '/s/'+sessionId });

  var testPath = path.join(__dirname + '/public/html/map.html');
  res.sendFile(testPath);
});

/* GET js bundle */
router.get('/js/map-follow-me-bundle.js', function(req, res) { 
  res.setHeader('content-type', 'application/javascript'); 
  browserify()
    .require('./map-follow-me.js', { expose: 'map-follow-me'} ) 
    .bundle() 
    .pipe(res); 
});

router.get('/css/bootstrap.css', function(req, res) {
  res.sendFile(path.join(__dirname + '/bower_components/bootstrap/dist/css/bootstrap.css'));
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var server = require('http').Server(app);
var io = require('socket.io')(server);

function onSession(session) {
  var sessionId = session.id;

  console.log('establishing session: ' + JSON.stringify(session));

  if (sessions.hasOwnProperty(sessionId)) {
    sessions[sessionId]++;

  } else {
    sessions[sessionId] = 1
  
    var ioSession = io.of(sessionId);
    ioSession.on('connection', function(sessionSocket) {
      var sessionSocketId = sessionSocket.id;

      console.log('session established: session: ' + sessionId + '; socket: ' + sessionSocket.id);

      sessionSocket.on('location update', function(msg) {
        console.log('session: ' + sessionId + '; sessionSocketId: ' + 
          sessionSocketId + '; location update: ' + JSON.stringify(msg));

        ioSession.emit('location update', msg);
      });

      sessionSocket.on('disconnect', function() {
        console.log('socket: ' + sessionSocketId + ' disconnecting from session: ' + JSON.stringify(session));
        if (--sessions[sessionId]) {
          var clientDisconnectMsg = { 
            client: { id: sessionSocketId },
            session: { id: sessionId }
          };

          console.log('emitting client disconnect: ' + JSON.stringify(clientDisconnectMsg));
          
          ioSession.emit('client disconnect', clientDisconnectMsg);
        }
      });
    });
  }
}

module.exports = {
  app: app,
  server: server
}
