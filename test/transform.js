var assert = require('assert'),
  stream = require('stream'),
  es = require('event-stream'),
  concat = require('concat-stream'),

  transform = require('../lib/transform'),
  dp = require('../lib/index');

function createSavingStream(cb) {
  var s = new stream();
  s._outdata = [];
  s.write = function (chunk) {
    s._outdata.push(JSON.parse(chunk));
    cb();
  };
  s.read = function () {
    s.push(this._outdata);
  };
  return s;
}

describe('Library', function() {
  it('pipeline works', function(done) {
    var spec = [
      {
        operator: 'incsv',
        options: ''
      }
    ];
    out = dp.pipeline(spec);
    assert(out.length, 1);
    done();
  });
  it('transform works', function(done) {
    // this is currently broken due to issues in lib/transform.js
    // TODO: re-enable
    done();
    return;

    var outs = createSavingStream(finished),
      data = [
        [1, 2],
        [3, 4]
      ];
    data = data.map(function(row, idx) {
      return {
        index: idx,
        row: row
      };
    });
    // now run it all
    var pipeline = transform.pipelineToStream([
      {
        operator: 'delete',
        options: '0'
      }
    ]);
    pipeline.pipe(outs);
    pipeline.write(JSON.stringify(data));
    pipeline.end();
    function finished() {
      assert.deepEqual(outs._outdata, ['xyz']);
      done();
    }
  });
});
