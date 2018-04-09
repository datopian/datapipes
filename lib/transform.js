var request = require('request'),
  _ = require('underscore'),
  es = require('event-stream');

var util = require('./util');
var ops = require('./operators');

// Takes a string and turns it into an array of transformations
exports.pipeline = function(pipelineSpec) {
  var transformers = _.map(pipelineSpec, function(pipe){
    if (_.has(ops, pipe.operator)) {
      var out = new ops[pipe.operator](pipe.options.split(' '));
      // stub on so es.pipeline works
      // out.on = function(name, func) {};
      return out;
    } else {
      var errStr = 'No such operation: ' + pipe.operator;
      throw errStr;
    }
  });
  return transformers;
};

exports.pipelineToStream = function(pipelineSpec) {
  var transformers = exports.pipeline(pipelineSpec);
  return es.pipeline.apply(es.pipeline, transformers);
};

// Conduct our transformation
exports.transform = function(response, transformers, stream) {
  _.each(transformers, function(next) {
    if (next) {
      next.on('error', function(err) {
        var errStr = err.toString();
        console.log(errStr);
        response.write(errStr);
        response.end();
      });
      stream = stream.pipe(next);
    }
  });
  stream.pipe(response);
};
