#!/usr/bin/env node
var inherits = require('util').inherits;
var Writable = require('stream').Writable;
var TransformOMatic = require('./lib/transform');

function stdout() {
  if (!(this instanceof stdout)) return new stdout();
  Writable.call(this, {objectMode: true});
}

inherits(stdout, Writable);

stdout.prototype._write = function(chunk, encoding, done) {
  process.stdout.write(chunk);
  done();
};

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

TransformOMatic.transform(stdout(), transformers, argv.url);
