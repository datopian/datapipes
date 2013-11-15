var request = require('request');
var _ = require('underscore');

var ops = require('./operators');

var TransformOMatic = {
  // Takes a string and turns it into an array of transformations
  pipeline: function(transformStr){
    var calls = transformStr.split('/');
    var transformers = _.map(calls, function(call){
      call = call.trim().split(' ');
      var name = call.shift();
      if (_.has(ops, name)) {
        return new ops[name](call);
      } else {
        console.log('Noop');
      }
    });
    return transformers;
  },

  // Conduct our transformation
  transform: function(response, transformers, url, failure){
    var instream = request(url);
    instream.on('response', function(data){
      if (response.statusCode != 200) {
        failure(response);
      } else {
        var stream = data;
        _.each(transformers, function(next) {
          stream = stream.pipe(next);
        });
        if (stream.contentType) {
          response.setHeader("Content-Type", stream.contentType());
        } else {
          // default to plain text
          response.setHeader("Content-Type", "text/plain; charset=utf-8");
        }
        stream.pipe(response);
      }
    });
  },

  // hack the input to the required form
  rejig: function(transformStr) {
    // formats currently available
    var inputFormats = ['csv'];
    var outputFormats = ['csv', 'html'];

    // defaults
    var defaultInputFormat = 'csv';
    var defaultOutputFormat = defaultInputFormat;

    var transform = transformStr.split('/');
    var numOps = transform.length;

    // parser-related stuff
    var inputFormatSpecified = false;
    if (numOps == 1) {
      if (['', 'none'].indexOf(transform[0]) != -1) {
        // 'none' operator is a special case
        return 'none';
      } else {
        op = transform[0].trim().split(' ');
        if (inputFormats.indexOf(op[0]) != -1) {
          defaultOutputFormat = op.join(' ');
          op[0] = 'in' + op[0];
          transform[0] = op.join(' ');
          inputFormatSpecified = true;
        }
      }
    } else {
      for (x = 0; x < numOps - 1; x++) {
        op = transform[x].trim().split(' ');
        if (inputFormats.indexOf(op[0]) != -1) {
          // update the default output format
          defaultOutputFormat = op.join(' ');
          op[0] = 'in' + op[0];
          transform[x] = op.join(' ');
          inputFormatSpecified = true;
          break;
        }
      }
    }
    if (!inputFormatSpecified) {
      transform.unshift('in' + defaultInputFormat);
      numOps += 1;
    }

    // renderer-related stuff
    var lastOp = transform[numOps-1].trim().split(' ');
    if (outputFormats.indexOf(lastOp[0]) != -1) {
      lastOp[0] = 'out' + lastOp[0];
      transform[numOps-1] = lastOp.join(' ');
    } else {
      // use the default output format
      transform.push('out' + defaultOutputFormat);
    }

    return transform.join('/');
  },
};

module.exports = TransformOMatic;
