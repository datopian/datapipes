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
      var name = call[0];
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
        stream = data;
        _.each(transformers, function(next) {
          stream = stream.pipe(next);
        });
        response.setHeader("Content-Type", stream.contentType());
        stream.pipe(response);
      }
    });
  },

  // hack the input to the required form
  rejig: function(transformStr) {
    transform = transformStr.split('/');

    firstOp = transform[0].trim().split(' ');
    if (firstOp[0] == 'csv') {
      firstOp[0] = 'incsv';
      transform[0] = firstOp.join(' ');
    } else {
      // default to parsing csv
      transform.unshift('incsv');
    }

    numOps = transform.length;
    lastOp = transform[numOps-1].trim().split(' ');
    if (lastOp[0] == 'html') {
      lastOp[0] = 'outhtml';
      transform[numOps-1] = lastOp.join(' ');
    } else if (lastOp[0] == 'none') {
      lastOp[0] = 'outcsv';
      transform[numOps-1] = lastOp.join(' ');
    } else {
      // default to outputting csv
      transform.push('outcsv');
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
