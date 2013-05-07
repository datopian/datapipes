var fs = require('fs');

var express = require('express');
var csv = require('csv');
var Stream = require('stream');
var request = require('request');
var path = require('path');

var app = express();

//CORS middleware
var CORSSupport = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}

app.configure(function(){
  app.set('port', process.env.PORT || 5000);
  app.set('views', __dirname + '/templates');
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(CORSSupport);
  app.use(express.static(path.join(__dirname, 'public')));
});

function convert(instream, outstream, mapfunc) {
  var outcsv = csv();

  outcsv
    .from.stream(instream)
    .to.stream(outstream)
    .transform(mapfunc)
    ;
}

// var url = 'http://static.london.gov.uk/gla/expenditure/docs/2012-13-P12-250.csv';
// var url = 'http://data.openspending.org/datasets/gb-local-gla/data/2013-jan.csv';
app.get('/', function(req, res) {
  res.sendfile(__dirname + '/templates/index.html');
});

app.get('/csv/:op', function(req, res) {
  var url = req.query.url;
  var instream = request(url);
  var outstream = res;
  mapfunc = makeMapFunc(req.params.op, req);
  convert(instream, outstream, mapfunc);
});

function makeMapFunc(op, req) {
  if (op == 'delete') {
    var range = req.query.range;
    var parts = range.split(',');
    mapfunc = function(row, idx) {
      var matches = false;
      parts.forEach(function(part) {
        if (part.indexOf(':') != -1) {
          var _t = part.split(':');
          if (idx >= _t[0] && idx < _t[1]) {
            matches = true;
            return;
          }
        } else {
          part = parseInt(part);
          if (idx == part) {
            matches = true;
            return;
          }
        }
      });
      if (matches) return null;
      else return row;
    }
  } else if(op == 'head'){
      var lines = 0;
      var k = parseInt(req.query.n) || 10 // See man head for variable name

      // *nix head
      mapfunc = function(row, idx){
          if(lines < k){
              lines += 1;
              return row
          }else{
              return null;
          }
      }

  } else {
    mapfunc = function(row, idx) {
      return row;
    }
  }
  return mapfunc
}

app.listen(app.get('port'), function() {
  console.log("Listening on " + app.get('port'));
});
