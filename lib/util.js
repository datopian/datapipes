exports.parseUrl = function(path, query) {
  // remove leading&trailing spaces&slashes
  var transformStr = path.replace(/(\/|\s)+$/g, '');
  transformStr = transformStr.replace(/^(\/|\s)+/g, '');
  // replace nbsps with spaces
  transformStr = transformStr.replace(/ /g, ' ');

  var transform = transformStr.split('/');

  // 'none' operator is a special case
  if (transform.length == 1 && ['', 'none'].indexOf(transform[0]) != -1) {
    return [{
      operator: 'none',
      options: ''
    }];
  }

  transform = transform.map(function(opString) {
    var ops = opString.trim().split(' '),
      op = ops.shift();
    // deal with vars ...
    ops = ops.map(function(arg) {
      if (query && arg.length > 0 && arg.charAt(0) == '$') {
        return query[arg.substr(1)];
      }
      return arg;
    });
    return {
      operator: op,
      options: ops.join(' ')
    };
  });

  // TODO: validate operations
  // if (supportedFormats.indexOf(op[0]) != -1) {

  // first operator __must__ be a parser
  if (transform[0].operator === 'csv') {
    transform[0].operator = 'incsv';
  } else {
    transform.unshift({
      operator: 'incsv',
      options: ''
    });
  }

  var supportedFormats = ['csv', 'html'];
  var defaultOutputFormat = 'csv';

  // last operator __must__ be a renderer
  var lastOp = transform[transform.length-1];
  if (supportedFormats.indexOf(lastOp.operator) != -1) {
    lastOp.operator = 'out' + lastOp.operator;
  } else {
    // use the default output format
    transform.push({
      operator: 'out' + defaultOutputFormat,
      options: ''
    });
  }

  return transform;
};
