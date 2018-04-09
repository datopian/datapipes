var assert = require('assert');
var csv = require('csv');
var stream = require('stream');
var _ = require('underscore');

var ops = require('../../lib/operators.js');

var headerStr = 'this,is,the,header,row,,,,,,,,,,,,,,,,';
var headerRow = headerStr.split(',');
var headerData = JSON.stringify({row: headerRow, index: 0});

var out = new stream();

describe('strip', function(){
  describe('an empty row', function(){
    var dataStr = ',,,,,,,,,,,,,,,,,,,,';
    var row = dataStr.split(',');
    var data = JSON.stringify({row: row, index: 1});

    it('should strip the row', function(done){
      rowCount = 0;
      out.write = function(d) {
        var stripDataStr = JSON.parse(d).row.join(',');
        assert.equal(stripDataStr, headerStr);
        rowCount++;
      };

      out.end = function(d) {
        assert.equal(rowCount, 1);
        done();
      };

      var strip = new ops.strip();
      strip.write(headerData);
      strip.write(data);
      strip.end();
      strip.pipe(out);
    });
  });

  describe('a partially-filled row', function(){
    var dataStr = '2006/2007 - 12,81.2,163.0,244.2,77.4,143.4,220.5,5.4%,7.6%,6.8%,4.6%,4.4%,4.5%,,,,,,,,';
    var row = dataStr.split(',');
    var data = JSON.stringify({row: row, index: 1});

    it('should *not* strip the row', function(done){
      rowCount = 0;
      out.write = function(d) {
        rowCount++;
      };

      out.end = function(d) {
        assert.equal(rowCount, 2);
        done();
      };

      var strip = new ops.strip();
      strip.write(headerData);
      strip.write(data);
      strip.end();
      strip.pipe(out);
    });
  });
});
