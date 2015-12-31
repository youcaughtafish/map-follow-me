'use strict';

var express = require('express');
var router = express.Router();
var shortid = require('shortid');
var browserify = require('browserify');
var path = require('path');

module.exports = function routes(params) {
  /* GET home page. */
  router.get('/', function(req, res, next) {
    console.log('redirecting to: /s/' + sessionId);
    var sessionId = shortid.generate();
    res.redirect('/' + sessionId);
   });
   
  router.get('/:sessionId', function(req, res, next) {
    var sessionId = req.params.sessionId;
    params.onSession({ id: '/'+sessionId });

    var mapPath = path.join(__dirname + './../../client/public/html/map.html');
    console.log('dirname: ' + __dirname);
    console.log('mapPath: ' + mapPath);
    res.sendFile(mapPath);
  });

  /* GET js bundle */
  router.get('/js/map-follow-me-bundle.js', function(req, res) { 
    console.log('browserifying map-follow-me-bundle');
    res.setHeader('content-type', 'application/javascript'); 
    browserify()
      .require(path.join(__dirname + './../../client/map-follow-me'), { expose: 'map-follow-me'} )
      .transform('reactify')
      .bundle() 
      .pipe(res); 
  });

  router.get('/css/bootstrap.css', function(req, res) {
    res.sendFile(path.join(__dirname + './../../bower_components/bootstrap/dist/css/bootstrap.css'));
  });

  return router;
};