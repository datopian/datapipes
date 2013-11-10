var inherits = require('util').inherits;
var Transform = require('stream').Transform;
var toIntArr = require('./tools').toIntArr;
var csv = require('csv');
var _ = require('underscore');

operators = {
  incsv: function(args) {
    return csv()
      .transform(function(row, index) {
        return JSON.stringify({'row': row, 'index': index});
      });
  },

  // return our HEAD transformation
  head: function(args) {
    options = options || {objectMode: true};

    Transform.call(this, options);

    this._number = args[2] || 10;
    this._lines = 0;
  },

  // return a transformation that will cut columns.
  // Accepts a comma separated list of column positions to remove.
  // This is 0-indexed.
  cut: function(args) {
    options = {objectMode: true};

    Transform.call(this, options);

    columns = args[1] || "";
    // Convert the indices to ints
    this._idxes = toIntArr(columns);
  },

  // transformation that will grep for a pattern
  grep: function(args) {
    options = {objectMode: true};

    Transform.call(this, options);

    this._pattern = args[1];
  },

  // return a transformation that will delete empty rows
  strip: function(args) {
    options = {objectMode: true};

    Transform.call(this, options);
  },

  // transformation that will delete rows
  delete: function(args) {
    options = {objectMode: true};

    Transform.call(this, options);

    range = args[1];
    this._parts = range.split(',');
  },

  outcsv: function(args) {
    options = {objectMode: true};

    Transform.call(this, options);
  },

  // return our HTML transformation
  outhtml: function(args) {
    options = {objectMode: true};

    Transform.call(this, options);
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

inherits(operators.cut, Transform);

operators.cut.prototype._transform = function(chunk, encoding, done) {
  var json = JSON.parse(chunk);

  _.each(this._idxes, function(position) {
    delete json.row[position];
  });

  json.row = _.without(json.row, undefined);
  this.push(JSON.stringify(json));

  done();
};

inherits(operators.grep, Transform);

operators.grep.prototype._transform = function(chunk, encoding, done) {
  json = JSON.parse(chunk);

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
  json = JSON.parse(chunk);

  keep = _.some(json.row, function(val) {
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
  json = JSON.parse(chunk);
  var idx = json.index;

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

  done();
};

inherits(operators.outcsv, Transform);

operators.outcsv.prototype._transform = function(chunk, encoding, done) {
  var self = this;
  var json = JSON.parse(chunk);
  var row = _.map(json, function(value) {
    return value;
  });

  csv()
    .from.array(row)
    .to.string(function(data){
      self.push(data + '\n');
      done();
    })
  ;
};

operators.outcsv.prototype.contentType = function() {
  return "text/plain; charset=utf-8";
};

inherits(operators.outhtml, Transform);

operators.outhtml.prototype._transform = function(chunk, encoding, done) {
  json = JSON.parse(chunk);
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
