var _ = require('underscore');

var tools = {
  optimist: function (){
    delete require.cache[require.resolve('optimist')];
    return require('optimist');
  },
};

module.exports = tools;
