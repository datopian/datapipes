var fs = require('fs');

var express = require('express');
var csv = require('csv');
var Stream = require('stream');
var request = require('request');
var path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 5000);
  app.set('views', __dirname + '/templates');
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(path.join(__dirname, 'public')));
});

function convert(instream, outstream, mapfunc) {
  var outcsv = csv();

  outcsv
    .from.stream(instream, {columns: true})
    .to.stream(outstream, {header: true})
    .transform(mapfunc)
    ;
}

// var url = 'http://static.london.gov.uk/gla/expenditure/docs/2012-13-P12-250.csv';
// var url = 'http://data.openspending.org/datasets/gb-local-gla/data/2013-jan.csv';
app.get('/', function(req, res) {
  var url = req.query.url;
  if (!url) {
    res.sendfile(__dirname + '/templates/index.html');
  } else {
    handleIt(url, res);
  }
});

function handleIt(url, res) {
  var instream = request(url);
  var outstream = res;
  mapfunc = function(row, idx) {
    row['Vendor Name'] = row['Vendor Name'] + 'xxx';
    if (idx < 6) {
      return null;
    } else {
      return row;
    }
  }
  convert(instream, outstream, mapfunc);
}

app.listen(app.get('port'), function() {
  console.log("Listening on " + app.get('port'));
});

