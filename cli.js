#!/usr/bin/env node
var stdout = require('stdout');
var TransformOMatic = require('./lib/transform');

var argv = require('optimist')
  .options({
    url: {string: true, demand: true},
    v: {alias: 'verbose', boolean: true},
  })
  .argv
;

var transformStr = argv._.join(' ');
transformStr = TransformOMatic.rejig(transformStr);

var transformers = TransformOMatic.pipeline(transformStr);

var failure = function(resp){
  console.log(resp.statusCode, 'Error code ' + resp.statusCode + ' with upstream URL: ' + argv.url);
};

TransformOMatic.transform(stdout(), transformers, argv.url, failure);
