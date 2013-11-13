var inherits = require('util').inherits;
var Transform = require('stream').Transform;
var toIntArr = require('./tools').toIntArr;
var optimist = require('./tools').optimist;
var FixedQueue = require('./fixedqueue');
var csv = require('csv');
var _ = require('underscore');

var operators = {
  incsv: function(args) {
    var argv = optimist()
      .options({
        d: {alias: 'delimiter', default: ',', string: true},
        e: {alias: 'encoding', default: 'utf-8', string: true},
        p: {alias: 'escapechar', default: '\\', string: true},
        q: {alias: 'quotechar', default: '\"', string: true},
        t: {alias: 'tabs', boolean: true},
        H: {alias: 'no-header-row', boolean: true},
        S: {alias: 'skipinitialspace', boolean: true},
      })
      .parse(args)
    ;
    if (argv.t) {
      // tabs switch overrides delimiter opt
      argv.d = '\t';
    }
    return csv()
      .from.options({
        delimiter: argv.d,
        encoding: argv.e,
        escape: argv.p,
        quote: argv.q,
        ltrim: argv.S,
      })
      .transform(function(row, index) {
        return JSON.stringify({'row': row, 'index': index});
      });
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
    this._lines = 0;
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

    var columns = argv._[0].toString();
    // Convert the indices to ints
    this._idxes = toIntArr(columns);
    this._complement = argv.complement;
    // have we performed the complement yet?
    this._complemented = false;
  },

  // transformation that will grep for a pattern
  grep: function(args) {
    Transform.call(this, {objectMode: true});

    var argv = optimist()
      .parse(args)
    ;

    this._pattern = argv._[0];
  },

  // return a transformation that will delete empty rows
  strip: function(args) {
    Transform.call(this, {objectMode: true});
  },

  // transformation that will delete rows
  delete: function(args) {
    Transform.call(this, {objectMode: true});

    var argv = optimist()
      .parse(args)
    ;

    var range = argv._[0].toString();
    this._parts = range.split(',');
    this._index = 0;
  },

  outcsv: function(args) {
    Transform.call(this, {objectMode: true});

    var argv = optimist()
      .options({
        d: {alias: 'delimiter', default: ',', string: true},
        p: {alias: 'escapechar', default: '\\', string: true},
        q: {alias: 'quotechar', default: '\"', string: true},
        t: {alias: 'tabs', boolean: true},
        H: {alias: 'no-header-row', boolean: true},
      })
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
  },

  // return our HTML transformation
  outhtml: function(args) {
    Transform.call(this, {objectMode: true});
    this._initialHtmlSent = false;
  },
};

inherits(operators.head, Transform);

operators.head.prototype._transform = function(chunk, encoding, done) {
  if (this._lines < this._number) {
    this._lines += 1;
    this.push(chunk);
  }

  done();
};

inherits(operators.tail, Transform);

operators.tail.prototype._transform = function(chunk, encoding, done) {
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

  if (this._complement && !this._complemented) {
    this._idxes = _.difference(_.range(json.row.length), this._idxes);
    this._complemented = true;
  }

  _.each(this._idxes, function(position) {
    delete json.row[position];
  });

  json.row = _.without(json.row, undefined);

  this.push(JSON.stringify(json));

  done();
};

inherits(operators.grep, Transform);

operators.grep.prototype._transform = function(chunk, encoding, done) {
  var json = JSON.parse(chunk);

  if (json.index === 0) {
    this.push(chunk);
  } else {
    var match = false;
    var self = this;

    _.each(json.row, function(value) {
      if (value.indexOf(self._pattern) != -1) {
        match = true;
      }
    });

    if (match) {
      this.push(chunk);
    }
  }

  done();
};

inherits(operators.strip, Transform);

operators.strip.prototype._transform = function(chunk, encoding, done) {
  var json = JSON.parse(chunk);

  var keep = _.some(json.row, function(val) {
    return val !== '';
  });

  if (keep) {
    this.push(chunk);
  }

  done();
};

inherits(operators.delete, Transform);

operators.delete.prototype._transform = function(chunk, encoding, done) {
  if(_.isUndefined(this._parts)){
    this.push(chunk);
  }

  var idx = this._index;

  var matches = false;
  _.each(this._parts, function(part) {
    if (part.indexOf(':') != -1) {
      var _t = part.split(':');
      if (idx >= _t[0] && idx <= _t[1]) {
        matches = true;
      }
    } else {
      part = parseInt(part);
      if (idx == part) {
        matches = true;
      }
    }
  });

  if (!matches) this.push(chunk);

  this._index += 1;

  done();
};

inherits(operators.outcsv, Transform);

operators.outcsv.prototype._transform = function(chunk, encoding, done) {
  var self = this;
  var row = JSON.parse(chunk).row;

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
    this.push('<tr><th id="L0" rel="#L0" class="counter"></th>');

    this._initialHtmlSent = true;
  }

  if (json.index === 0) {
    json.row.forEach(function(item) {
      self.push('<th title="%s">%s</th>'.replace(/%s/g, item));
    });
    this.push('</tr></thead><tbody>');
  } else {
    this.push('<tr id="L%s"><td class="counter"><a href="#L%s">%s</a></td>'.replace(/%s/g, json.index));
    json.row.forEach(function(item) {
      self.push('<td><div>' + item + '</div></td>');
    });
    this.push('</tr>');
  }

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
