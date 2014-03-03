var request = require('request')
  , _ = require('underscore')
  , es = require('event-stream')
  ;

var util = require('./util');
var ops = require('./operators');

// Takes a string and turns it into an array of transformations
exports.pipeline = function(pipelineSpec, response) {
  var transformers = _.map(pipelineSpec, function(pipe){
    if (_.has(ops, pipe.operator)) {
      try {
        var out = new ops[pipe.operator](pipe.options);
        // stub on so es.pipeline works
        // out.on = function(name, func) {};
        return out;
      } catch (err) {
        var errStr = err.toString();
        console.log(errStr);
        response.write(errStr);
        response.end();
      }
    } else {
      var errStr = 'No such operation: ' + name;
      console.log(errStr);
      response.send(500, errStr);
      response.end();
    }
  });
  return transformers;
};

exports.pipelineToStream = function(pipelineSpec) {
  var transformers = exports.pipeline(pipelineSpec);
  return es.pipeline.apply(es.pipeline, transformers);
}

// Conduct our transformation
exports.transform = function(response, transformers, url) {
  var stream;
  try {
    stream = request(url)
      .on('error', function(err){
        var errStr = 'Error with upstream URL: ' + url;
        console.log(errStr);
        response.send(500, errStr);
      })
    ;
  } catch (e) {
    var errStr = 'Invalid URL: ' + url;
    console.log(errStr);
    response.send(500, errStr);
    return;
  }

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

