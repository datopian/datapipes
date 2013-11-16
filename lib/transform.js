var request = require('request');
var _ = require('underscore');

var ops = require('./operators');

var TransformOMatic = {
  // Takes a string and turns it into an array of transformations
  pipeline: function(transformStr, query){
    var calls = transformStr.split('/');
    var transformers = _.map(calls, function(call){
      call = call.trim().split(' ');
      var name = call.shift();

      call = _.map(call, function(arg) {
        if (arg.length > 0 && arg.charAt(0) == '$') {
          return query[arg.substr(1)];
        }
        return arg;
      });

      if (_.has(ops, name)) {
        return new ops[name](call);
      } else {
        console.log('Noop');
      }
    });
    return transformers;
  },

  // Conduct our transformation
  transform: function(response, transformers, url){
    var stream = request(url)
      .on('error', function(err){
        response.send(500, 'Error with upstream URL: ' + url);
      })
    ;

    _.each(transformers, function(next) {
      if (next) {
        stream = stream.pipe(next);
      }
    });
    stream.pipe(response);
  },

  // hack the input to the required form
  rejig: function(transformStr) {
    var supportedFormats = ['csv', 'html'];

    var defaultInputFormat = 'csv';
    var defaultOutputFormat = defaultInputFormat;

    var transform = transformStr.split('/');

    // 'none' operator is a special case
    if (transform.length == 1 && ['', 'none'].indexOf(transform[0]) != -1) {
      return 'none';
    }

    // first operator __must__ be a parser
    op = transform[0].trim().split(' ');
    if (supportedFormats.indexOf(op[0]) != -1) {
      // update the default output format
      defaultOutputFormat = op.join(' ');
      op[0] = 'in' + op[0];
      transform[0] = op.join(' ');
    } else {
      transform.unshift('in' + defaultInputFormat);
    }

    var outin = 'out';
    // loop through transforms, alternating
    // between parser and renderer
    for (x = 1; x < transform.length; x++) {
      op = transform[x].trim().split(' ');
      if (supportedFormats.indexOf(op[0]) != -1) {
        // update the default output format
        defaultOutputFormat = op.join(' ');
        op[0] = outin + op[0];
        outin = (outin == 'in') ? 'out' : 'in';
        transform[x] = op.join(' ');
      }
    }

    // last operator __must__ be a renderer
    var lastOp = transform[transform.length-1].trim().split(' ');
    if (lastOp[0].length <= 'out'.length || supportedFormats.indexOf(lastOp[0].substr(3)) == -1) {
      // use the default output format
      transform.push('out' + defaultOutputFormat);
    }

    return transform.join('/');
  },
};

module.exports = TransformOMatic;
