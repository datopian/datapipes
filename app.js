var fs = require('fs');
var express = require('express');
var path = require('path');
var nunjucks = require('nunjucks');
var marked = require('marked');
var _ = require('underscore');

var TransformOMatic = require('./lib/transform');

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

function getMarkdownContent(filepath, cb) {
  fs.readFile(filepath, 'utf8', function(err, text) {
    if (err) {
      cb(err, null);
    } else {
      cb(null, marked(text, {gfm: false}));
    }
  });
}

function datapipe(path, query, res) {
  // remove leading&trailing spaces&slashes
  var transformStr = path.replace(/(\/|\s)+$/g, '');

  // rewrite the transform string in the form required
  transformStr = TransformOMatic.rejig(transformStr);

  var transformers = TransformOMatic.pipeline(transformStr, query);

  if (_.last(transformers).contentType) {
    res.setHeader("Content-Type", _.last(transformers).contentType());
  } else {
    // default to plain text
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
  }

  TransformOMatic.transform(res, transformers, query.url);
}

// this route runs everything through a pipeline.
// it never serves docs pages.
app.get(/\/exec\/(.*)?/, function(req, res) {
  datapipe(req.params[0], req.query, res);
});

app.get(/\/interactive(\/.*)?/, function(req, res) {
  var pipeline = '';
  queryStr = _.map(req.query, function(v, k) {
    return k + '=' + v;
  }).join('&');

  if (req.params[0] !== undefined) {
    pipeline = req.params[0] + '?' + queryStr;
  } else if (queryStr !== '') {
    pipeline = '/csv/head?' + queryStr;
  }

  res.render('interactive.html', {
    pipeline: pipeline,
  });
});

app.get('/*', function(req, res) {
  var mdFilename;
  var path = req.params[0];

  if (!req.query.url) {
    // if there's no url parameter,
    // attempt to serve a docs page
    var page = path.split('/')[0];
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
        res.render('docs.html', {
          content: content
        });
      }
    });
  } else {
    datapipe(path, req.query, res);
  }
});

app.listen(app.get('port'), function() {
  console.log("Listening on " + app.get('port'));
});

exports.app = app;
