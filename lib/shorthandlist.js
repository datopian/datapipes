var _ = require('underscore');

// class for keeping track of our
// shorthand row and column indexing.

// constructor mainly just parses all the strings to ints
function ShorthandList(shorthand) {
  if (!(this instanceof ShorthandList)) {
    return new ShorthandList(shorthand);
  }

  var shorthandArr = shorthand.split(',');
  var self = this;

  // generate our shorthand array
  this._shorthand = _.map(shorthandArr, function(part) {
    if (part.indexOf(':') == -1) {
      return parseInt(part);
    } else {
      var range = part.split(':');
      return _.map(range, function(val, idx) {
        var num = parseInt(val);
        if (isNaN(num)) {
          return undefined;
        }
        return num;
      });
    }
  });
}

// expand out the shorthand list to an array
ShorthandList.prototype.expand = function(len) {
  if (this._expanded !== undefined) return this._expanded;

  var self = this;
  this._expanded = _.chain(this._shorthand)
    .map(function(part){
      if (!_.isArray(part)) {
        return [part];
      } else {
        if (part[0] === undefined) {
          return _.range(part[1] + 1);
        }
        if (part[1] === undefined) {
          return _.range(part[0], len + 1);
        }
        return _.range(part[0], part[1] + 1);
      }
    })
    .flatten()
    .uniq()
    .value();

  return this._expanded;
};

// returns true if the shorthand list includes
// the given index
ShorthandList.prototype.includes = function(idx) {
  return _.any(this._shorthand, function(part) {
    if (!_.isArray(part)) {
      if (idx == part) {
        return true;
      }
    } else {
      if (part[0] === undefined) {
        if (idx <= part[1]) {
          return true;
        }
      } else if (part[1] === undefined) {
        if (idx >= part[0]) {
          return true;
        }
      } else {
        if (idx >= part[0] && idx <= part[1]) {
          return true;
        }
      }
    }
    return false;
  });
};

module.exports = ShorthandList;
