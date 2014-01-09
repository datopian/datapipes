# Using as a Library

```
var dp = require('datapipes');

// load data from inUrl, write to outFile after applying the sequence of transformations
dp.transform(inUrl, outFile, [
  {
    operator: 'head'
  },
  {
    operator: 'delete'
  }
]);

## do it by hand

```
// create a head operator
// this is a stream transform - see node docs
var headOp = dp.operators.head(args, options);

// create a CSV
var csv = csv().from(...)

var outFile = fs.createWriteStream('tmp.txt');

csv.pipe(headOp).pipe(outFile);
```

## Make Your Own Operators

We have a helpful `mapToTranform`

Suppose you have a map function

function helloMap(obj, idx) {
  row[0] = 'hello'
  return row;
}

operators['hello'] = mapToTransform(helloMap);

## How It Works

Operators are Transform streams - i.e. a readable and writable stream
i.e. a readable stream pipes data into it, and a writable stream is piped
from it. The data piped in is a series of JSON objects of the form:

    {
      row: ['row', 'data', 'goes', 'here'],
      index: 7
    }

The data pushed out should be of the same form.

Questions:

* How do I skip a row (just don't push it on ...)
* How do I tell an upstream part of the pipeline to halt

Most of the operators here inherit the node Transform class. As such, they
define a _transform() method, and optionally a _flush() method. More
details here:

  http://nodejs.org/api/stream.html#stream_class_stream_transform_1

