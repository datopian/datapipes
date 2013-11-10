var _ = require('underscore');

tools = {
  // expand out a string like '1,3,5-8' to [1,3,5,6,7,8]
  toIntArr: function toIntArr(str){
    var parts = str.split(',');
    return _.chain(parts)
      .map(function(part){
        if (part.indexOf('-') == -1) {
          return [parseInt(part)];
        } else {
          range = part.split('-');
          return _.range(parseInt(range[0]), parseInt(range[1])+1);
        }
      })
      .flatten()
      .uniq()
      .value();
  },
};

module.exports = tools;