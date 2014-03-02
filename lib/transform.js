var request = require('request');
var _ = require('underscore');

var util = require('./util');
var ops = require('./operators');

var TransformOMatic = {
  // Takes a string and turns it into an array of transformations
  pipeline: function(pipelineSpec, response){
    var transformers = _.map(pipelineSpec, function(pipe){
      if (_.has(ops, pipe.operator)) {
        try {
          return new ops[pipe.operator](pipe.options);
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
  },

  // Conduct our transformation
  transform: function(response, transformers, url){
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
  }
};

module.exports = TransformOMatic;
