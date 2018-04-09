var fs = require('fs'),
  express = require('express'),
  path = require('path'),
  nunjucks = require('nunjucks'),
  request = require('request'),
  marked = require('marked'),
  _ = require('underscore');

var util = require('./lib/util'),
  TransformOMatic = require('./lib/transform'),
  routes = require('./routes/index');

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

function errorHandler(err, req, res, next) {
  res.status(500);
  res.render('error', { error: err });
}

app.set('port', process.env.PORT || 5000);
app.set('views', __dirname + '/templates');
app.use(chromeSpaceReplace);
app.use(CORSSupport);
app.use(errorHandler);
app.use(express.static(path.join(__dirname, 'public')));

var env = new nunjucks.Environment(new nunjucks.FileSystemLoader('views'));
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
  var pipelineSpec = util.parseUrl(path, query);
  var transformers = TransformOMatic.pipeline(pipelineSpec, res);

  if (_.last(transformers).contentType) {
    res.setHeader("Content-Type", _.last(transformers).contentType());
  } else {
    // default to plain text
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
  }

  var url = query.url;
  var stream = request(url)
    .on('error', function(err) {
      var errStr = 'Error with upstream URL: ' + url;
      console.log(errStr);
      res.send(500, errStr);
    });
  TransformOMatic.transform(res, transformers, stream);
}

app.get(/\/interactive(\/.*)?/, routes.wizard);
app.get(/\/wizard(\/.*)?/, routes.wizard);

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
