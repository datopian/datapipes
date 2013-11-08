var app = require('../app.js').app;
var request = require('supertest')(app);
var _ = require('underscore');

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
