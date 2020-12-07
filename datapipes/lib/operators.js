var _ = require('underscore');
var csv = require('csv');
var inherits = require('util').inherits;
var PassThrough = require('stream').PassThrough;
var request = require('request');
var Sandbox = require('sandbox');
var Transform = require('stream').Transform;
var FixedQueue = require('./fixedqueue');
var optimist = require('./tools').optimist;
var ShorthandList = require('./shorthandlist');

var headerrow = false;

// For a given pipeline, each operator is constructed by calling:
//
//   ```new operators[operator name](args)```
//
// ...where operator name is the name of the operator, and args is a string
// array of the input arguments to the operator.
//
// The constructed operator is then treated as a readable and writable stream
// i.e. a readable stream pipes data into it, and a writable stream is piped
// from it. The data piped in is a series of stringified JSON  objects of the
// form:
//
//   {row: ['row', 'data', 'goes', 'here'], index: 7}
//
// The data pushed out should be of the same form.
//
// Most of the operators here inherit the node Transform class. As such, they
// define a _transform() method, and optionally a _flush() method. More
// details here:
//
//   http://nodejs.org/api/stream.html#stream_class_stream_transform_1

var operators = {
  incsv: function(args) {
    var argv = optimist()
      .options({
        d: {alias: 'delimiter', default: ',', string: true},
        p: {alias: 'escapechar', default: '\\', string: true},
        q: {alias: 'quotechar', default: '\"', string: true},
        t: {alias: 'tabs', boolean: true},
        H: {alias: 'no-header-row', boolean: true},
        S: {alias: 'skipinitialspace', boolean: true},
      })
      .string(['delimiter', 'escapechar', 'quotechar'])
      .parse(args)
    ;

    // by default, assume there is a header row
    headerrow = true;
    if (argv.H || argv['header-row'] === false) {
      headerrow = false;
    }

    if (argv.t) {
      // tabs switch overrides delimiter opt
      argv.d = '\t';
    }
    return csv()
      .from.options({
        delimiter: argv.d,
        escape: argv.p,
        quote: argv.q,
        ltrim: argv.S,
      })
      .transform(function(row, index) {
        return JSON.stringify({'row': row, 'index': index});
      });
  },

  // none transformation
  none: function(args) {
    PassThrough.call(this);
  },

  // return our HEAD transformation
  head: function(args) {
    Transform.call(this, {objectMode: true});

    var argv = optimist()
      .options('n', {
        default: 10,
      })
      .parse(args)
    ;

    this._number = argv.n;
    if (argv._[0]) {
      try {
        this._number = parseInt(argv._[0]);
      } catch(e) {}
    }
    this._lines = 0;

    this._pushheaderrow = headerrow;
  },

  // return our tail transformation
  tail: function(args) {
    Transform.call(this, {objectMode: true});

    var argv = optimist()
      .options('n', {
        default: '10',
        string: true
      })
      .parse(args)
    ;

    var number = argv.n;

    if (number.charAt(0) == '+') {
      // relative to the beginning of the stream
      this._rel = 'beginning';
      this._lines = 0;
      this._number = number;
    } else {
      // relative to the end of the stream
      this._rel = 'end';
      if (number.charAt(0) == '-') {
        number = -number;
      }
      this._fixedqueue = new FixedQueue(number);
    }

    this._pushheaderrow = headerrow;
  },

  // return a transformation that will cut columns.
  // Accepts a comma separated list of column positions to remove.
  // This is 0-indexed.
  cut: function(args) {
    Transform.call(this, {objectMode: true});

    var argv = optimist()
      .boolean('complement')
      .parse(args)
    ;

    if (argv._.length < 1) {
      throw 'Error: cut requires at least 1 argument.';
    }

    var columns = argv._[0].toString();

    this._complement = argv.complement;

    this._cols = ShorthandList(columns);
  },

  // transformation that will grep for a pattern
  grep: function(args) {
    Transform.call(this, {objectMode: true});

    var argv = optimist()
      .options({
        c: {alias: 'columns', string: true},
        i: {alias: 'case-insensitive', boolean: true},
        e: {alias: 'regexp', string: true},
        v: {alias: 'invert-match', boolean: true},
      })
      .string(['columns', 'regexp'])
      .parse(args)
    ;

    if (argv.c !== undefined) {
      this._cols = ShorthandList(argv.c);
    }

    var flags = (argv.i) ? 'i' : '';
    var regex = argv.e || argv._[0];
    this._pattern = new RegExp(regex, flags);

    this._invert = argv.v;

    this._pushheaderrow = headerrow;
  },

  // return a transformation that will find and replace all
  // occurrences of a string
  replace: function(args) {
    Transform.call(this, {objectMode: true});

    var argv = optimist()
      .options({
        c: {alias: 'columns', string: true},
        r: {alias: 'regexp', boolean: true},
      })
      .string('columns')
      .parse(args)
    ;

    if (argv._.length < 1) {
      throw 'Error: replace requires at least 1 argument.';
    }

    if (argv.c !== undefined) {
      this._cols = ShorthandList(argv.c);
    }

    this._find = (argv.r) ? new RegExp(argv._[0], 'g') : argv._[0];
    this._replace = (argv._.length > 1) ? argv._[1] : '';

    this._pushheaderrow = headerrow;
  },

  // return a transformation that will delete empty rows
  strip: function(args) {
    Transform.call(this, {objectMode: true});

    this._pushheaderrow = headerrow;
  },

  // transformation that will delete rows
  delete: function(args) {
    Transform.call(this, {objectMode: true});

    var argv = optimist()
      .parse(args)
    ;

    if (argv._.length < 1) {
      throw 'Error: delete requires at least 1 argument.';
    }

    var shorthand = argv._[0].toString();
    this._shorthandlist = ShorthandList(shorthand);
    this._index = 0;

    this._pushheaderrow = headerrow;
  },

  map: function(args) {
    Transform.call(this, {objectMode: true});

    var argv = optimist()
      .parse(args)
    ;

    if (argv._.length < 1) {
      throw 'Error: map requires at least 1 argument.';
    }

    this._map_url = argv._[0];
    this._sandbox = new Sandbox();

    this._pushheaderrow = headerrow;
  },

  outcsv: function(args) {
    Transform.call(this, {objectMode: true});

    var argv = optimist()
      .options({
        d: {alias: 'delimiter', default: ',', string: true},
        p: {alias: 'escapechar', default: '\\', string: true},
        q: {alias: 'quotechar', default: '\"', string: true},
        t: {alias: 'tabs', boolean: true},
        S: {alias: 'skipinitialspace', boolean: true},
      })
      .string(['delimiter', 'escapechar', 'quotechar'])
      .parse(args)
    ;
    if (argv.t) {
      // tabs switch overrides delimiter opt
      argv.d = '\t';
    }
    this._options = {
      delimiter: argv.d,
      escape: argv.p,
      quote: argv.q,
    };
    this._trimInitialSpace = argv.skipinitialspace;
  },

  // return our HTML transformation
  outhtml: function(args) {
    Transform.call(this, {objectMode: true});

    this._initialHtmlSent = false;
  },
};

inherits(operators.none, PassThrough);

inherits(operators.head, Transform);

operators.head.prototype._transform = function(chunk, encoding, done) {
  if (this._pushheaderrow) {
    this.push(chunk);
    this._pushheaderrow = false;
    return done();
  }

  if (this._lines < this._number) {
    this._lines += 1;
    this.push(chunk);
  } else {
    this.push(null);
  }

  done();
};

inherits(operators.tail, Transform);

operators.tail.prototype._transform = function(chunk, encoding, done) {
  if (this._pushheaderrow) {
    this.push(chunk);
    this._pushheaderrow = false;
    return done();
  }

  if (this._rel == 'end') {
    this._fixedqueue.push(chunk);
  } else {
    if (this._lines < this._number) {
      this._lines += 1;
    } else {
      this.push(chunk);
    }
  }
  done();
};

operators.tail.prototype._flush = function(done) {
  if (this._rel == 'end') {
    var chunk = this._fixedqueue.shift();
    while (chunk !== undefined) {
      this.push(chunk);
      chunk = this._fixedqueue.shift();
    }
  }
  done();
};

inherits(operators.cut, Transform);

operators.cut.prototype._transform = function(chunk, encoding, done) {
  var json = JSON.parse(chunk);

  if (this._expandedCols === undefined) {
    this._expandedCols = this._cols.expand(json.row.length);
    if (this._complement) {
      this._expandedCols = _.difference(_.range(json.row.length), this._expandedCols);
    }
  }

  _.each(this._expandedCols, function(position) {
    delete json.row[position];
  });

  json.row = _.without(json.row, undefined);

  this.push(JSON.stringify(json));

  done();
};

inherits(operators.grep, Transform);

operators.grep.prototype._transform = function(chunk, encoding, done) {
  if (this._pushheaderrow) {
    this.push(chunk);
    this._pushheaderrow = false;
    return done();
  }

  var json = JSON.parse(chunk);

  var self = this;

  var expandedCols = (this._cols !== undefined) ? this._cols.expand(json.row.length) : _.range(json.row.length);
  var match = _.any(expandedCols, function(idx) {
    return self._pattern.test(json.row[idx]);
  });

  if (this._invert) match = !match;

  if (match) this.push(chunk);

  done();
};

inherits(operators.replace, Transform);

operators.replace.prototype._transform = function(chunk, encoding, done) {
  if (this._pushheaderrow) {
    this.push(chunk);
    this._pushheaderrow = false;
    return done();
  }

  var json = JSON.parse(chunk);

  var self = this;


  var expandedCols;
  if (this._cols !== undefined) {
    expandedCols = this._cols.expand(json.row.length);
  } else {
    expandedCols = _.range(json.row.length);
  }
  _.each(expandedCols, function(idx) {
    json.row[idx] = json.row[idx].replace(self._find, self._replace);
  });

  this.push(JSON.stringify(json));

  done();
};

inherits(operators.strip, Transform);

operators.strip.prototype._transform = function(chunk, encoding, done) {
  if (this._pushheaderrow) {
    this.push(chunk);
    this._pushheaderrow = false;
    return done();
  }

  var json = JSON.parse(chunk);

  var keep = _.some(json.row, function(val) {
    return val !== '';
  });

  if (keep) this.push(chunk);

  done();
};

inherits(operators.delete, Transform);

operators.delete.prototype._transform = function(chunk, encoding, done) {
  if (this._pushheaderrow) {
    this.push(chunk);
    this._pushheaderrow = false;
    return done();
  }

  if(this._shorthandlist === undefined || !this._shorthandlist.includes(this._index)) {
    this.push(chunk);
  }

  this._index += 1;
  done();
};

inherits(operators.map, Transform);

operators.map.prototype._transform = function(chunk, encoding, done) {
  if (this._pushheaderrow) {
    this.push(chunk);
    this._pushheaderrow = false;
    return done();
  }

  function sandbox_run() {
    self._sandbox.run(self._map_fn + "transform('" + chunk + "');", function(output) {
      var result = output.result;
      if (result == 'null') {
        return done();
      }

      result = result.slice(1, -1);
      try {
        JSON.parse(result);
      } catch (e) {
        self.emit('error', new Error('Error performing map transform.'));
        return;
      }
      self.push(result);
      done();
    });
  }

  var self = this;
  if (this._map_fn === undefined) {
    request(this._map_url, function(error, response) {
      if (error !== null) {
        self.emit('error', new Error('Error opening map URL.'));
        return;
      }
      self._map_fn = response.body;
      sandbox_run();
    });
  } else {
    sandbox_run();
  }
};

operators.map.prototype._flush = function(done) {
  function sandbox_run() {
    self._sandbox.run(self._map_fn + "flush();", function(output) {
      var result = output.result;
      if (result == 'null') {
        return done();
      }

      result = result.slice(1, -1);
      try {
        JSON.parse(result);
      } catch (e) {
        self.emit('error', new Error('Error performing map flush.'));
        return;
      }
      self.push(result);
      done();
    });
  }

  var self = this;
  if (this._map_fn === undefined) {
    request(this._map_url, function(error, response) {
      self._map_fn = response.body;
      sandbox_run();
    });
  } else {
    sandbox_run();
  }
};

inherits(operators.outcsv, Transform);

operators.outcsv.prototype._transform = function(chunk, encoding, done) {
  var self = this;
  var row = JSON.parse(chunk).row;

  if (this._trimInitialSpace) {
    row = _.each(function(item) {
      return item.trimLeft(item);
    });
  }

  csv()
    .from.array([row])
    .to.string(function(data){
      self.push(data + '\n');
      done();
    }, self._options)
  ;
};

operators.outcsv.prototype.contentType = function() {
  return "text/plain; charset=utf-8";
};

inherits(operators.outhtml, Transform);

operators.outhtml.prototype._transform = function(chunk, encoding, done) {
  var json = JSON.parse(chunk);
  var self = this;

  if (!this._initialHtmlSent) {
    this.push('<html>');
    this.push('<head>');
    this.push('<link rel="stylesheet" href="/css/style.css" />');
    this.push('</head>');
    this.push('<body class="view-html">');
    this.push('<table>');
    this.push('<thead>');
    if (headerrow) {
      this.push('<tr><th class="counter"></th>');
      json.row.forEach(function(item) {
        self.push('<th title="%s">%s</th>'.replace(/%s/g, item));
      });
      this.push('</tr></thead><tbody>');

      this._initialHtmlSent = true;

      return done();
    } else {
      this.push('</thead><tbody>');
      this._initialHtmlSent = true;
    }
  }

  var index = json.index;
  if (headerrow) {
    // the header row was passed straight through
    // (without incrementing any counters) so we have
    // to correct for that here.
    index--;
  }

  this.push('<tr id="L%s"><td class="counter"><a href="#L%s">%s</a></td>'.replace(/%s/g, index));
  json.row.forEach(function(item) {
    self.push('<td><div>' + item + '</div></td>');
  });
  this.push('</tr>');

  done();
};

operators.outhtml.prototype._flush = function(done) {
  this.push('</tbody>');
  this.push('</table>');
  this.push('<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script>');
  this.push('<script src="/js/jquery.tablesorter.js"></script>');
  this.push('<script src="/js/table.js"></script>');
  this.push('</body></html>');

  done();
};

operators.outhtml.prototype.contentType = function() {
  return "text/html; charset=utf-8";
};

module.exports = operators;
