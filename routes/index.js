var fs = require('fs')
  , path = require('path')
  , marked = require('marked')
  , _ = require('underscore')
  ;

exports.wizard = function(req, res) {
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
};

