var util = require('../lib/util')
  , assert = require('assert')
  ;

describe('Library', function() {
  it('parseUrl works', function() {
    ins = [
      '/',
      '/csv/cut 1/'
    ];
    exp = [
      [{
        operator: 'none'
      }],
      [
        {
          operator: 'incsv',
          options: ''
        },
        {
          operator: 'cut',
          options: '1'
        },
        {
          operator: 'outcsv',
          options: ''
        }
      ]
    ];
    ins.forEach(function(path, idx) {
      var out = util.parseUrl(path);
      assert.deepEqual(out, exp[idx]);
    });

    var query = { abc: '111' };
    var out = util.parseUrl('/csv $abc/', query);
    var exp = [
      {
        operator: 'incsv',
        options: '111'
      },
      {
        operator: 'outcsv',
        options: ''
      }
    ];
    assert.deepEqual(out, exp);
  });
});

