var _ = require('underscore');

function ShorthandList(shorthand) {
  if (!(this instanceof ShorthandList)) return new ShorthandList(shorthand);
  this._shorthand = shorthand.split(',');
}

// expand out a string like '1,3,5:8' to [1,3,5,6,7,8]
ShorthandList.prototype.expand = function() {
  return _.chain(this._shorthand)
    .map(function(part){
      if (part.indexOf('-') == -1) {
        return [parseInt(part)];
      } else {
        var range = part.split('-');
        return _.range(parseInt(range[0]), parseInt(range[1])+1);
      }
    })
    .flatten()
    .uniq()
    .value();
};

ShorthandList.prototype.includes = function(idx) {
  var matches = false;
  _.each(this._shorthand, function(part) {
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
  return matches;
};

module.exports = ShorthandList;
