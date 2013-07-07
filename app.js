var fs = require('fs');

var express = require('express');
var csv = require('csv');
var Stream = require('stream');
var request = require('request');
var path = require('path');
var nunjucks = require('nunjucks')
var marked = require('marked');

var app = express();

//CORS middleware
var CORSSupport = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
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

var env = new nunjucks.Environment(new nunjucks.FileSystemLoader('templates'));
env.express(app);


function convert(instream, outstream, mapfunc) {
  var outcsv = csv();

  outcsv
    .from.stream(instream)
    .to.stream(outstream, {end: false})
    .transform(mapfunc)
    .on('end', function(count) {
      var out = mapfunc(null, 'end');
      if (out) { 
        outstream.write(out);
      }
      outstream.end();
    })
    ;
}

// var url = 'http://static.london.gov.uk/gla/expenditure/docs/2012-13-P12-250.csv';
// var url = 'http://data.openspending.org/datasets/gb-local-gla/data/2013-jan.csv';
app.get('/', function(req, res) {
  fs.readFile('docs/index.md', 'utf8', function(err, text) {
    var content = marked(text);
    res.render('index.html', {
      content: content
    });
  });
});

function getMarkdownContent(filepath, cb) {
  fs.readFile(filepath, 'utf8', function(err, text) {
    if (err) {
      cb(err, null);
    } else {
      cb(null, marked(text));
    }
  });
}

app.get('/csv/:op', function(req, res) {
  var url = req.query.url;
  if (!url) {
    getMarkdownContent('docs/op-' + req.params.op + '.md', function(err, content) {
      if (err) {
        res.send('No info on this operation yet');
      } else {
        res.render('index.html', {
          content: content
        });
      }
    });
  } else {
    doTransform(req, res, url)
  }
});

function doTransform(req, res, url) {
  var instream = request(url);
  var outstream = res;
  mapfunc = makeMapFunc(req.params.op, req);
  instream.on('response', function (resp) {
    if(resp.statusCode != 200) {
      res.send(resp.statusCode, 'Error code ' + resp.statusCode + ' with upstream URL: ' + url);
    } else {
      convert(instream, outstream, mapfunc);
    }
  });
}

function makeMapFunc(op, req) {
  if (op == 'delete') {
    var range = req.query.range;
    if (!range) {
      range = '1'
    }
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
  } else if(op == 'html') {
    mapfunc = htmlMapFunc
  } else {
    mapfunc = function(row, idx) {
      return row;
    }
  }
  return mapfunc
}

htmlMapFunc = function(row, idx) {
  if (idx == 0) {
    var out = '<html> \
      <head> \
        <link rel="stylesheet" href="/css/style.css" /> \
      </head> \
      <body class="view-html"> \
      <table> \
        <thead> \
          <tr><th id="L0" rel="#L0" class="counter"></th> \
    ';
    row.forEach(function(item) {
      out += '<th title="%s">%s</th>'.replace(/%s/g, item);
    });
    out += '</tr></thead><tbody>';
    return out;
  } else if (idx == 'end') {
    var out = '</tbody> \
      </table> \
      <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script> \
      <script src="/js/table.js"></script> \
      </body></html> \
    ';
    return out;
  } else {
    var out = '<tr id="L%s"><td class="counter"><a href="#L%s">%s</a></td>'.replace(/%s/g, idx);
    row.forEach(function(item) {
      out += '<td><div>' + item + '</div></td>';
    });
    out += '</tr>';
    return out;
  }
  // how do we put </table> at the end
}

app.listen(app.get('port'), function() {
  console.log("Listening on " + app.get('port'));
});
