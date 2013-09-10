var fs = require('fs');

var sys = require('sys');
var express = require('express');
var csv = require('csv');
var Stream = require('stream');
var request = require('request');
var path = require('path');
var nunjucks = require('nunjucks')
var marked = require('marked');
var _ = require('underscore');

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

function noop(arg){return arg}

function convert(instream, outstream, mapfunc) {
  var outcsv = csv();

  var initial = mapfunc(null, 'pre');
  if (initial){
    outstream.write(initial);
  }

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

// Collection of staticmethod(ish) things that will
// return a
var Transformations = {

  // HOF to return our HEAD transformation
  head: function(call){
    var lines = 0;
    var number = call[2];
    if(!number){
      var number = 40;
    }
    return function(row, idx){
      if(lines < number){
        lines += 1;
        return row
      }else{
        return null;
      }
    }
  },

  // HOF to return a transformation that will cut columns
  // Accepts a comma separated list of column positions to remove
  // This is 0-indexed.
  cut: function(call){
    var columns = call[1] || "";
    var parts = columns.split(',');

    // Convert the indices to ints and sort then reverse them
    var idxes = _.map(parts, function(num){ return parseInt(num)})
    idxes.sort().reverse()

    return function(row, index){
      if(index ==  'pre'){
        return null;
      }else if(index == 'post'){
        return null;
      }
      if (row === null) {
        return null;
      }

      // delete the values at the specific position
      _.each(idxes, function(position) {
        delete row[position]
      })

      return _.without(row, undefined)
    }
  },

  // HOF to return a transformation that will grep for a pattern
  grep: function(call){
    var pattern = call[1];
    return function(row, index){
      if(index == 0){
        return row
      }
      var match = false;
      _.each(row, function(value){
        if(value.indexOf(pattern) != -1){
          match = true;
        }
      });
      if(match){
        return row;
      }else{
        return null;
      }
    }
  },

  // HOF to return a transformation that will delete rows
  delete: function(call){
    var range = call[1];
    var parts = range.split(',');
    return function(row, idx) {
      var matches = false;
      if(_.isUndefined(parts)){
        return row
      }
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
  },

  // HOF to return our HTML transformation
  html: function(call){
    // Simple arity for now, just return
    return function(row, idx) {
      if (idx ==  'pre'){
        var out = '<html> \
<head> \
<link rel="stylesheet" href="/css/style.css" /> \
</head> \
<body class="view-html"> \
<table> \
<thead> \
<tr><th id="L0" rel="#L0" class="counter"></th> \
';
        return out;
      }
      else if (idx == 0) {
        var out =  '';
        row.forEach(function(item) {
          out += '<th title="%s">%s</th>'.replace(/%s/g, item);
        });
        out += '</tr></thead><tbody>';
        return out;
      } else if (idx == 'end') {
        var out = '</tbody> \
</table> \
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script> \
<script src="/js/jquery.tablesorter.js"></script> \
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

  }

}

var TransformOMatic = {

  // HOF to construct the row-by-row transformation for
  // a given set of transformations
  pipeline: function(transform_string){
    var calls = transform_string.split('/');
    var transformations = _.map(calls, function(call){
      call = call.split(' ');
      var name = call[0];
      if(_.has(Transformations, name)){
        return Transformations[name](call);
      }else{
        return noop;
      }
    })

    return function(row, index){
      var result = row;
      _.each(transformations, function(callable){
        if(_.isNull(result)){
          if(index !== 'pre' && index !== 'end'){
            return;
          }
        }
        result = callable(result, index);
      });
      return result;
    }
  },

  // Conduct our transformation
  transform: function(response, pipeline, url, failure){
    var instream = request(url);
    instream.on('response', function(data){
      if(response.statusCode != 200){
        failure(response);
      }else{
        convert(data, response, pipeline);
      }
    });
  },
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
      cb(null, marked(text, {gfm: false}));
    }
  });
}

app.get('/csv/*', function(req, res) {
  var url = req.query.url;
  if (!url) {
    var transform = req.params[0].split('/')[0];
    getMarkdownContent('docs/op-' + transform + '.md', function(err, content) {
      if (err) {
      console.log(err);
        res.send('No info on this operation yet');
      } else {
        res.render('index.html', {
          content: content
        });
      }
    });
  } else {
    //doTransform(req, res, url)
    var pipeline = TransformOMatic.pipeline(req.params[0]);

    var failure = function(resp){
      res.send(resp.statusCode, 'Error code ' + resp.statusCode + ' with upstream URL: ' + url);
    }

    TransformOMatic.transform(res, pipeline, url, failure);
  }
});

app.listen(app.get('port'), function() {
  console.log("Listening on " + app.get('port'));
});
