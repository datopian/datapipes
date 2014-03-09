var fs = require('fs')
  , path = require('path')
  , marked = require('marked')
  , _ = require('underscore')
  ;

exports.wizard = function(req, res) {
  var pipeline = '/csv/';
  if (!req.query.url) {
    res.render('interactive.html', tmplData);
    return;
  }

  queryStr = '?url=' + req.query.url;
  var tmp = _.extend({}, req.query);
  delete tmp.url;
  var pipes = '/csv/' + _.map(tmp, function(v, k) {
    return k + ' ' + v
  }).join('/');

  var pipeline = req.protocol + '://' + req.get('host') + pipes + '/' + queryStr;

  var tmplData = {
    url: req.query.url,
    pipeline: pipeline,
    query: tmp
  };

  res.render('interactive.html', tmplData);
};

