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

var chromeSpaceReplace = function(req, res, next) {
  var re = /(?:Windows|Macintosh).*?Chrome/;
  var agent = req.headers['user-agent'] || '';
  if (re.test(agent)) {
    var parts = req.url.split('?');
    var datapipe = parts.shift();
    if (datapipe.indexOf('%20') !== -1) {
      // replace %20s with nbsps
      datapipe = datapipe.replace(/%20/g, ' ');
      parts.unshift(datapipe);
      res.redirect(parts.join('?'));
      return;
    }
  }

  next();
};

app.configure(function(){
  app.set('port', process.env.PORT || 5000);
  app.set('views', __dirname + '/templates');
  app.use(express.logger('dev'));
  app.use(chromeSpaceReplace);
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
  // replace nbsps with spaces
  transformStr = transformStr.replace(/ /g, ' ');

  // rewrite the transform string in the form required
  transformStr = TransformOMatic.rejig(transformStr);

  var transformers = TransformOMatic.pipeline(transformStr, query, res);

  if (_.last(transformers).contentType) {
    res.setHeader("Content-Type", _.last(transformers).contentType());
  } else {
    // default to plain text
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
  }

  TransformOMatic.transform(res, transformers, query.url);
}

// this route runs everything through a pipeline.
// it never serves doc pages.
app.get(/\/exec\/(.*)?/, function(req, res) {
  path = req.params[0] || '';
  if (!req.query.url) {
    var errStr = 'A URL is required.';
    console.log(errStr);
    res.send(500, errStr);
    res.end();
    return;
  }
  datapipe(path, req.query, res);
});

app.get(/\/interactive(\/.*)?/, function(req, res) {
  var pipeline = '';
  queryStr = _.map(req.query, function(v, k) {
    return k + '=' + v;
  }).join('&');

  if (req.params[0] !== undefined) {
    pipeline = req.params[0] + '?' + queryStr;
  } else if (queryStr !== '') {
    // default pipeline: /csv/head
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
    // attempt to serve a doc page
    var page = path.split('/')[0];
    if (page === '') {
      mdFilename = 'doc/index.md';
    } else {
      mdFilename = 'doc/op-' + page + '.md';
    }
    getMarkdownContent(mdFilename, function(err, content) {
      if (err) {
        console.log(err);
        res.send(404, 'Page not found: ' + req.params[0]);
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
