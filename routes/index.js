var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  var testPath = path.join(__dirname + '/../public/html/map.html');
  console.log(testPath);
  res.sendFile(testPath);
});

module.exports = router;
