var app = require('../app.js').app;
var request = require('supertest')(app);
var assert = require('assert');
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

ops = ['cut', 'delete', 'grep', 'head', 'html', 'none', 'strip'];
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

describe('GET /csv/head/html', function(){
  it('should by default return 10 rows', function(done){
    url = '/csv/head/html?url=' + data_url;
    request
      .get(url)
      .expect('Content-Type', /html/)
      .expect(200)
      .end(function(err, res) {
        if (err) done(err);

        var out = res.text;
        numRows = out.match(/<tr/g).length;
        assert.equal(numRows, 10);

        done();
      });
  });

  it('should return 5 rows', function(done){
    url = '/csv/head -n 5/html?url=' + data_url;
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
