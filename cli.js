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

stdout.prototype.send = function(statuscode, msg) {
  process.stderr.write(msg + '\n');
};

var usage = '\nPerform streaming data transformations on remote csv files.\n';
usage += 'More details: http://datapipes.okfnlabs.org\n\n';
usage += 'Usage: $0 [-s] [-u URL] -- [PIPELINE]';

var argv = require('optimist')
  .options({
    u: {alias: 'url', string: true, demand: true, describe: 'URL of input data.'},
    s: {alias: 'share', boolean: true, describe: 'Generate a URL to share this.'},
  })
  .usage(usage)
  .demand(1)
  .argv
;

var transformStr = argv._.join(' ');

if (argv.s) {
  var transformUrl = 'http://datapipes.okfnlabs.org/';
  transformUrl += encodeURIComponent(transformStr);
  transformUrl += '?url=';
  transformUrl += argv.url;
  var stars = Array(transformUrl.length+1).join('*');

  console.log('URL to share:');
  console.log(stars);
  console.log(transformUrl);
  console.log(stars);

  return;
}

transformStr = TransformOMatic.rejig(transformStr);

var transformers = TransformOMatic.pipeline(transformStr);

TransformOMatic.transform(stdout(), transformers, argv.url);
