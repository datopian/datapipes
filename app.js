var fs = require('fs');
var express = require('express');
var request = require('request');
var path = require('path');
var nunjucks = require('nunjucks');
var marked = require('marked');
var _ = require('underscore');

var ops = require('./lib/tools').toIntArr;
var ops = require('./lib/operators');

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

var TransformOMatic = {
  // Conduct our transformation
  pipeline: function(transformStr){
    var calls = transformStr.split('/');
    var transformers = _.map(calls, function(call){
      call = call.trim().split(' ');
      var name = call.shift();
      if (_.has(ops, name)) {
        return new ops[name](call);
      } else {
        console.log('Noop');
      }
    });
    return transformers;
  },

  transform: function(response, transformers, url, failure){
    var instream = request(url);
    instream.on('response', function(data){
      if (response.statusCode != 200) {
        failure(response);
      } else {
        var stream = data;
        _.each(transformers, function(next) {
          stream = stream.pipe(next);
        });
        if (stream.contentType) {
          response.setHeader("Content-Type", stream.contentType());
        } else {
          // default to plain text
          response.setHeader("Content-Type", "text/plain; charset=utf-8");
        }
        stream.pipe(response);
      }
    });
  },

  // hack the input to the required form
  rejig: function(transformStr) {
    var inputFormats = ['csv'];
    var outputFormats = ['csv', 'html'];

    var defaultInputFormat = 'csv';
    var defaultOutputFormat = defaultInputFormat;

    var transform = transformStr.split('/');
    var numOps = transform.length;

    // parser-related stuff
    var inputFormatSpecified = false;
    if (numOps == 1) {
      if (['', 'none'].indexOf(transform[0]) != -1) {
        // 'none' operator is a special case
        return 'none';
      } else {
        op = transform[0].trim().split(' ');
        if (inputFormats.indexOf(op[0]) != -1) {
          defaultOutputFormat = op.join(' ');
          op[0] = 'in' + op[0];
          transform[0] = op.join(' ');
          inputFormatSpecified = true;
        }
      }
    } else {
      for (x = 0; x < numOps - 1; x++) {
        op = transform[x].trim().split(' ');
        if (inputFormats.indexOf(op[0]) != -1) {
          // update the default output format
          defaultOutputFormat = op.join(' ');
          op[0] = 'in' + op[0];
          transform[x] = op.join(' ');
          inputFormatSpecified = true;
          break;
        }
      }
    }
    if (!inputFormatSpecified) {
      transform.unshift('in' + defaultInputFormat);
      numOps += 1;
    }

    // renderer-related stuff
    var lastOp = transform[numOps-1].trim().split(' ');
    if (outputFormats.indexOf(lastOp[0]) != -1) {
      lastOp[0] = 'out' + lastOp[0];
      transform[numOps-1] = lastOp.join(' ');
    } else {
      // use the default output format
      transform.push('out' + defaultOutputFormat);
    }

    return transform.join('/');
  },
};

function getMarkdownContent(filepath, cb) {
  fs.readFile(filepath, 'utf8', function(err, text) {
    if (err) {
      cb(err, null);
    } else {
      cb(null, marked(text, {gfm: false}));
    }
  });
}

app.get('/*', function(req, res) {
  var url = req.query.url;
  var mdFilename;
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
    var transformStr = req.params[0].replace(/(\/+|\s+)$/, '');

    transformStr = TransformOMatic.rejig(transformStr);

    var transformers = TransformOMatic.pipeline(transformStr);

    var failure = function(resp){
      res.send(resp.statusCode, 'Error code ' + resp.statusCode + ' with upstream URL: ' + url);
    };

    TransformOMatic.transform(res, transformers, url, failure);
  }
});

app.listen(app.get('port'), function() {
  console.log("Listening on " + app.get('port'));
});

exports.app = app;
