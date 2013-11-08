var app = require('../app.js').app;
var request = require('supertest')(app);
var assert = require('assert');
var csv = require('csv');
var _ = require('underscore');

var data_url = 'https://raw.github.com/okfn/datapipes/master/test/data/gla.csv';

describe('GET /', function(){
  it('should respond with homepage', function(done){
    request
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200, done);
  });
});

ops = ['none', 'head', 'cut', 'delete', 'grep', 'html', 'strip'];
_.each(ops, function(op) {
  describe('GET /csv/' + op, function(){
    it('should respond with ' + op + ' docs page', function(done){
      request
        .get('/csv/' + op)
        .expect('Content-Type', /html/)
        .expect(200, done);
    });
  });
});

describe('GET /csv/none?url=' + data_url, function(){
  it('should return file untouched (100 rows of csv)', function(done){
    url = '/csv/none/?url=' + data_url;
    request
      .get(url)
      .expect('Content-Type', /plain/)
      .expect(200)
      .end(function(err, res) {
        if (err) done(err);

        csv()
          .from.string(res.text)
          .on('end', function(count) {
            assert.equal(count, 100);
            done();
          })
        ;
      });
  });
});

describe('GET /csv/head/?url=' + data_url, function(){
  it('should return 10 csv rows', function(done){
    url = '/csv/head/?url=' + data_url;
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

describe('GET /csv/head -n 5/?url=' + data_url, function(){
  it('should return 5 csv rows', function(done){
    url = '/csv/head -n 5/?url=' + data_url;
    request
      .get(url)
      .expect('Content-Type', /plain/)
      .expect(200)
      .end(function(err, res) {
        if (err) done(err);

        csv()
          .from.string(res.text)
          .on('end', function(count) {
            assert.equal(count, 5);
            done();
          })
        ;
      });
  });
});

describe('GET /csv/head -n 5/html/?url=' + data_url, function(){
  it('should return 5 html rows', function(done){
    url = '/csv/head -n 5/html/?url=' + data_url;
    request
      .get(url)
      .expect('Content-Type', /html/)
      .expect(200)
      .end(function(err, res) {
        if (err) done(err);

        var out = res.text;
        numRows = out.match(/<tr/g).length;
        assert.equal(numRows, 5);

        done();
      });
  });
});
