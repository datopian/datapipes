var app = require('../app.js').app;
var request = require('supertest')(app);
var assert = require('assert');
var csv = require('csv');
var _ = require('underscore');

var data_url = 'https://raw.github.com/okfn/datapipes/master/test/data/gla.csv';

// some facts about our data
var num_rows = 100;
var num_cols = 8;
var num_blank_rows = 1;
var num_london_rows = 15; // rows containing the word LONDON


describe('GET /', function(){
  it('should respond with html', function(done){
    request
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200, done);
  });
});

describe('Docs', function(){
  ops = ['none', 'head', 'cut', 'delete', 'grep', 'strip', 'html'];
  _.each(ops, function(op) {
    var url = '/' + op;
    describe('GET ' + url, function(){
      it('should respond with html', function(done){
        request
          .get(url)
          .expect('Content-Type', /html/)
          .expect(200, done);
      });
    });
  });
});

describe('none op', function(){
  var url = '/csv/none/?url=' + data_url;
  describe('GET ' + url, function(){
    it('should return csv with ' + num_rows + ' rows and ' + num_cols + ' columns (original file)', function(done){
      request
        .get(url)
        .expect('Content-Type', /plain/)
        .expect(200)
        .end(function(err, res) {
          if (err) done(err);

          csv()
            .from.string(res.text)
            .on('record', function(row,index){
              assert.equal(row.length, num_cols);
            })
            .on('end', function(count) {
              assert.equal(count, num_rows);
              done();
            })
          ;
        });
    });
  });
});

describe('head op', function(){
  var url = '/csv/head/?url=' + data_url;
  describe('GET ' + url, function(){
    it('should return 10 csv rows', function(done){
      request
        .get(url)
        .expect('Content-Type', /plain/)
        .expect(200)
        .end(function(err, res) {
          if (err) done(err);

          csv()
            .from.string(res.text)
            .on('end', function(count) {
              assert.equal(count, 10);
              done();
            })
          ;
        });
    });
  });

  var num_rows_head = 5;
  var url2 = '/csv/head -n ' + num_rows_head + '/?url=' + data_url;
  describe('GET ' + url2, function(){
    it('should return ' + num_rows_head + ' csv rows', function(done){
      request
        .get(url2)
        .expect('Content-Type', /plain/)
        .expect(200)
        .end(function(err, res) {
          if (err) done(err);

          csv()
            .from.string(res.text)
            .on('end', function(count) {
              assert.equal(count, num_rows_head);
              done();
            })
          ;
        });
    });
  });
});

describe('cut op', function(){
  var url = '/csv/cut 0,3/?url=' + data_url;
  var num_cols_removed = 2;
  describe('GET ' + url, function(){
    it('should return csv with ' + (num_cols - num_cols_removed) + ' columns (' + num_cols_removed + ' removed)', function(done){
      request
        .get(url)
        .expect('Content-Type', /plain/)
        .expect(200)
        .end(function(err, res) {
          if (err) done(err);

          csv()
            .from.string(res.text)
            .on('record', function(row,index){
              assert.equal(row.length, (num_cols - num_cols_removed));
            })
            .on('end', function(count) {
              done();
            })
          ;
        });
    });
  });

  var url2 = '/csv/cut 0,2-4/?url=' + data_url;
  describe('GET ' + url2, function(){
    var num_cols_removed = 4;
    it('should return csv with ' + (num_cols - num_cols_removed) + ' columns (' + num_cols_removed + ' removed)', function(done){
      request
        .get(url2)
        .expect('Content-Type', /plain/)
        .expect(200)
        .end(function(err, res) {
          if (err) done(err);

          csv()
            .from.string(res.text)
            .on('record', function(row,index){
              assert.equal(row.length, (num_cols - num_cols_removed));
            })
            .on('end', function(count) {
              done();
            })
          ;
        });
    });
  });
});

describe('delete op', function(){
  var url = '/csv/delete 10,20/?url=' + data_url;
  describe('GET ' + url, function(){
    var num_rows_removed = 2;
    it('should return csv with ' + (num_rows - num_rows_removed) + ' rows (' + num_rows_removed + ' removed)', function(done){
      request
        .get(url)
        .expect('Content-Type', /plain/)
        .expect(200)
        .end(function(err, res) {
          if (err) done(err);

          csv()
            .from.string(res.text)
            .on('end', function(count) {
              assert.equal(count, (num_rows - num_rows_removed));
              done();
            })
          ;
        });
    });
  });

  var url2 = '/csv/delete 1,10:20/?url=' + data_url;
  describe('GET ' + url2, function(){
    var num_rows_removed = 12;
    it('should return csv with ' + (num_rows - num_rows_removed) + ' rows (' + num_rows_removed + ' removed)', function(done){
      request
        .get(url2)
        .expect('Content-Type', /plain/)
        .expect(200)
        .end(function(err, res) {
          if (err) done(err);

          csv()
            .from.string(res.text)
            .on('end', function(count) {
              assert.equal(count, (num_rows - num_rows_removed));
              done();
            })
          ;
        });
    });
  });
});

describe('grep op', function(){
  var url = '/csv/grep LONDON/?url=' + data_url;
  describe('GET ' + url, function(){
    it('should return csv with ' + (num_london_rows + 1) + ' rows (1 header plus ' + num_london_rows + ' containing the word "LONDON")', function(done){
      request
        .get(url)
        .expect('Content-Type', /plain/)
        .expect(200)
        .end(function(err, res) {
          if (err) done(err);

          csv()
            .from.string(res.text)
            .on('record', function(row,index){
              if (index === 0) {
                // skip the header row
                return;
              }
              var contains_london = _.some(row, function(val) {
                return val.indexOf('LONDON') != -1;
              });
              assert.equal(contains_london, true);
            })
            .on('end', function(count) {
              assert.equal(count, (num_london_rows + 1));
              done();
            })
          ;
        });
    });
  });
});

describe('strip op', function(){
  var url = '/csv/strip/?url=' + data_url;
  var num_non_blank = num_rows - num_blank_rows;
  describe('GET ' + url, function(){
    it('should return ' + num_non_blank + ' csv rows, none of which are empty', function(done){
      request
        .get(url)
        .expect('Content-Type', /plain/)
        .expect(200)
        .end(function(err, res) {
          if (err) done(err);

          csv()
            .from.string(res.text)
            .on('record', function(row,index){
              var emptyRow = _.every(row, function(val) {
                return val === '';
              });
              assert.notEqual(emptyRow, true);
            })
            .on('end', function(count) {
              assert.equal(count, num_non_blank);
              done();
            })
          ;
        });
    });
  });
});

describe('html op', function(){
  var num_rows_head = 5;
  var url = '/csv/head -n ' + num_rows_head + '/html/?url=' + data_url;
  describe('GET ' + url, function(){
    it('should return ' + num_rows_head + ' html rows', function(done){
      request
        .get(url)
        .expect('Content-Type', /html/)
        .expect(200)
        .end(function(err, res) {
          if (err) done(err);

          var out = res.text;
          var numRows = out.match(/<tr/g).length;
          assert.equal(numRows, num_rows_head);

          done();
        });
    });
  });
});
