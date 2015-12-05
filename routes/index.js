var express = require('express');
var router = express.Router();
var path = require('path');
var browserify = require('browserify');

/* GET home page. */
router.get('/', function(req, res, next) {
  var testPath = path.join(__dirname + '/../public/html/map.html');
  console.log(testPath);
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



module.exports = router;
