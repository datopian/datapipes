var inherits = require('util').inherits;
var Writable = require('stream').Writable;

function stdout() {
  if (!(this instanceof stdout)) return new stdout();
  Writable.call(this, {objectMode: true});
}

inherits(stdout, Writable);

stdout.prototype._write = function(chunk, encoding, done) {
  process.stdout.write(chunk);
  done();
};

stdout.prototype.send = function(statuscode, msg) {
  process.stderr.write(msg + '\n');
};

module.exports = stdout;
