var assert = require('assert');
var csv = require('csv');
var stream = require('stream');
var _ = require('underscore');

var ops = require('../../lib/operators.js');

var dataStr = '2006/2007 - 12,81.2,163.0,244.2,77.4,143.4,220.5,5.4%,7.6%,6.8%,4.6%,4.4%,4.5%,,,,,,,,';
var row = dataStr.split(',');
var data = JSON.stringify({row: row, index: 0});

var out = new stream();

describe('cut', function(){
  describe('single column', function(){
    var cutStr = '2';
    it('should cut a single column from the data', function(done){
      out.write = function(d) {
        var expected = row.slice(0);
        expected.splice(parseInt(cutStr), 1).join(',');
        var cutDataStr = JSON.parse(d).row.join(',');
        assert.equal(cutDataStr, expected);
        done();
      };

      var cut = new ops['cut']([cutStr]);
      cut.write(data);
      cut.pipe(out);
    });
  });

  describe('multiple columns', function(){
    var cutStr = '1:4';
    it('should cut columns 1-4 from the data', function(done){
      out.write = function(d) {
        var expected = row.slice(0);
        expected.splice(1, 4).join(',');
        var cutDataStr = JSON.parse(d).row.join(',');
        assert.equal(cutDataStr, expected);
        done();
      };

      var cut = new ops['cut']([cutStr]);
      cut.write(data);
      cut.pipe(out);
    });
  });

  describe('with assumed upper column bound', function(){
    var cutStr = '13:';
    it('should cut columns 13-end from the data', function(done){
      out.write = function(d) {
        var expected = row.slice(0, 13).join(',');
        var cutDataStr = JSON.parse(d).row.join(',');
        assert.equal(cutDataStr, expected);
        done();
      };

      var cut = new ops['cut']([cutStr]);
      cut.write(data);
      cut.pipe(out);
    });
  });

  describe('with assumed lower column bound', function(){
    var cutStr = ':4';
    it('should cut columns 0-4 from the data', function(done){
      out.write = function(d) {
        var expected = row.slice(5).join(',');
        var cutDataStr = JSON.parse(d).row.join(',');
        assert.equal(cutDataStr, expected);
        done();
      };

      var cut = new ops['cut']([cutStr]);
      cut.write(data);
      cut.pipe(out);
    });
  });

  describe('negative column index', function(){
    var cutStr = ',-10';
    it('should cut 10th from last column from the data', function(done){
      out.write = function(d) {
        var expected = row.slice(0);
        expected.splice(-10, 1).join(',');
        var cutDataStr = JSON.parse(d).row.join(',');
        assert.equal(cutDataStr, expected);
        done();
      };

      var cut = new ops['cut']([cutStr]);
      cut.write(data);
      cut.pipe(out);
    });
  });

  describe('negative column range', function(){
    var cutStr = ',-10:-8';
    it('should cut 10th from last column to 8th from last column from the data', function(done){
      out.write = function(d) {
        var expected = row.slice(0);
        expected.splice(-10, 3).join(',');
        var cutDataStr = JSON.parse(d).row.join(',');
        assert.equal(cutDataStr, expected);
        done();
      };

      var cut = new ops['cut']([cutStr]);
      cut.write(data);
      cut.pipe(out);
    });
  });

  describe('negative column with assumed upper bound', function(){
    var cutStr = ',-8:';
    it('should cut 8th from last column to last column from the data', function(done){
      out.write = function(d) {
        var expected = row.slice(0, -8);
        var cutDataStr = JSON.parse(d).row.join(',');
        assert.equal(cutDataStr, expected);
        done();
      };

      var cut = new ops['cut']([cutStr]);
      cut.write(data);
      cut.pipe(out);
    });
  });
});
