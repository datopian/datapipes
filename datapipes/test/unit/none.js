var assert = require('assert');
var csv = require('csv');
var stream = require('stream');
var _ = require('underscore');

var ops = require('../../lib/operators.js');

var headerStr = 'this,is,the,header,row,,,,,,,,,,,,,,,,';
var headerRow = headerStr.split(',');
var headerData = JSON.stringify({row: headerRow, index: 0});

var out = new stream();

describe('none', function(){
  var dataStr = '2006/2007 - 12,81.2,163.0,244.2,77.4,143.4,220.5,5.4%,7.6%,6.8%,4.6%,4.4%,4.5%,,,,,,,,';
  var row = dataStr.split(',');
  var data = JSON.stringify({row: row, index: 1});

  it('should pass everything through untouched', function(done){
    rowCount = 0;
    out.write = function(d) {
      rowCount++;
    };

    out.end = function(d) {
      assert.equal(rowCount, 2);
      done();
    };

    var none = new ops.none();
    none.write(headerData);
    none.write(data);
    none.end();
    none.pipe(out);
  });
});
