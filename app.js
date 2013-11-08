var fs = require('fs');

var sys = require('sys');
var express = require('express');
var csv = require('csv');
var Stream = require('stream');
var request = require('request');
var path = require('path');
var nunjucks = require('nunjucks');
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
};

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

function noop(arg){return arg;}

// expand out a string like '1,3,5-8' to [1,3,5,6,7,8]
function toIntArr(str){
  var parts = str.split(',');
  return _.chain(parts)
          .map(function(part){
            if (part.indexOf('-') == -1) {
              return [parseInt(part)];
            } else {
              range = part.split('-');
              return _.range(parseInt(range[0]), parseInt(range[1])+1);
            }
          })
          .flatten()
          .uniq()
          .value();
}

// Collection of staticmethod things that will
// return a
var Converters = {

  csv_to_csv: function() {
    return function(instream, outstream, mapfunc) {
      var outcsv = csv();
      outstream.header("Content-Type", "text/plain; charset=utf-8");
      outcsv
        .from.stream(instream)
        .to.stream(outstream)
        .transform(mapfunc);
    };
  },
  csv_to_html: function() {
    return function(instream, outstream, mapfunc) {
      var outcsv = csv();

      outstream.header("Content-Type", "text/html; charset=utf-8");
      outstream.write('<html>');
      outstream.write('<head>');
      outstream.write('<link rel="stylesheet" href="/css/style.css" />');
      outstream.write('</head>');
      outstream.write('<body class="view-html">');
      outstream.write('<table>');
      outstream.write('<thead>');
      outstream.write('<tr><th id="L0" rel="#L0" class="counter"></th>');

      outcsv
        .from.stream(instream)
        .to.stream(outstream, {end: false})
        .transform(mapfunc)
        .on('end', function(count) {
          outstream.write('</tbody>');
          outstream.write('</table>');
          outstream.write('<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script>');
          outstream.write('<script src="/js/jquery.tablesorter.js"></script>');
          outstream.write('<script src="/js/table.js"></script>');
          outstream.write('</body></html>');
          outstream.end();
        })
      ;
    };
  },
};

// Collection of staticmethod(ish) things that will
// return a
var Transformations = {

  // HOF to return our HEAD transformation
  head: function(call){
    var lines = 0;
    var number = call[2];
    if(!number){
      number = 10;
    }
    return function(row, idx){
      if(lines < number){
        lines += 1;
        return row;
      }else{
        return null;
      }
    };
  },

  // HOF to return a transformation that will cut columns
  // Accepts a comma separated list of column positions to remove
  // This is 0-indexed.
  cut: function(call){
    var columns = call[1] || "";

    // Convert the indices to ints
    var idxes = toIntArr(columns);

    return function(row, index){
      // delete the values at the specific position
      _.each(idxes, function(position) {
        delete row[position];
      });

      return _.without(row, undefined);
    };
  },

  // HOF to return a transformation that will grep for a pattern
  grep: function(call){
    var pattern = call[1];
    return function(row, index){
      if(index == 0){
        return row;
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
    };
  },

  // HOF to return a transformation that will delete empty rows
  strip: function(call){
    return function(row, idx) {
      discard = _.every(row, function(val) {
        return val === '';
      });
      return (discard) ? null : row;
    };
  },

  // HOF to return a transformation that will delete rows
  delete: function(call){
    var range = call[1];
    var parts = range.split(',');
    return function(row, idx) {
      var matches = false;
      if(_.isUndefined(parts)){
        return row;
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
    };
  },

  // HOF to return our HTML transformation
  html: function(call){
    // Simple arity for now, just return
    return function(row, idx) {
      var out;
      if (idx == 0) {
        out =  '';
        row.forEach(function(item) {
          out += '<th title="%s">%s</th>'.replace(/%s/g, item);
        });
        out += '</tr></thead><tbody>';
        return out;
      } else {
        out = '<tr id="L%s"><td class="counter"><a href="#L%s">%s</a></td>'.replace(/%s/g, idx);
        row.forEach(function(item) {
          out += '<td><div>' + item + '</div></td>';
        });
        out += '</tr>';
        return out;
      }
    };

  }

};

var TransformOMatic = {

  // HOF to construct the row-by-row transformation for
  // a given set of transformations
  pipeline: function(transform_string){
    var calls = transform_string.split('/');
    var transformations = _.map(calls, function(call){
      call = call.trim().split(' ');
      var name = call[0];
      if(_.has(Transformations, name)){
        return Transformations[name](call);
      }else{
        return noop;
      }
    });

    return function(row, index){
      var result = row;
      _.each(transformations, function(callable){
        if(_.isNull(result)) return;
        result = callable(result, index);
      });
      return result;
    };
  },

  // Conduct our transformation
  transform: function(response, pipeline, url, converter, failure){
    var instream = request(url);
    instream.on('response', function(data){
      if(response.statusCode != 200){
        failure(response);
      }else{
        converter(data, response, pipeline);
      }
    });
  },
};


// var url = 'http://static.london.gov.uk/gla/expenditure/docs/2012-13-P12-250.csv';
// var url = 'http://data.openspending.org/datasets/gb-local-gla/data/2013-jan.csv';

function getMarkdownContent(filepath, cb) {
  fs.readFile(filepath, 'utf8', function(err, text) {
    if (err) {
      cb(err, null);
    } else {
      cb(null, marked(text, {gfm: false}));
    }
  });
}

app.get('*', function(req, res) {
  var url = req.query.url;
  if (!url) {
    var page = req.params[0].split('/')[0];
    if (page === '') {
      mdFilename = 'docs/index.md';
    } else {
      mdFilename = 'docs/op-' + page + '.md';
    }
    getMarkdownContent(mdFilename, function(err, content) {
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
    transformStr = req.params[0].replace(/(\/+|\s+)$/, '');

    transform = transformStr.toLowerCase().split('/');
    setFormat = function(part, allowedFormats, defaultFormat) {
      format = part.trim().split(' ')[0];
      return (_.contains(allowedFormats, format)) ? format : defaultFormat;
    };
    from = setFormat(transform[0], ['csv'], 'csv');
    to = setFormat(_.last(transform), ['csv', 'html'], 'csv');
    converter = Converters[from + '_to_' + to]();

    var pipeline = TransformOMatic.pipeline(transformStr);

    var failure = function(resp){
      res.send(resp.statusCode, 'Error code ' + resp.statusCode + ' with upstream URL: ' + url);
    };

    TransformOMatic.transform(res, pipeline, url, converter, failure);
  }
});

app.listen(app.get('port'), function() {
  console.log("Listening on " + app.get('port'));
});
