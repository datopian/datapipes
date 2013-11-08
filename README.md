[![Build
Status](https://travis-ci.org/okfn/datapipes.png)](https://travis-ci.org/okfn/datapipes)

Data Pipes = Unix-Style Data Tools + CSV + Web

Web service to provide unix-style `cut`, `grep`, `sed` in a streaming, "pipe-like" manner.

At the moment we operate on CSV files only (plain txt perhaps coming soon ...).

## API and Usage

See <http://datapipes.okfnlabs.org/>

### Discussion

API is under discussion and development - see:

* [API structure issue](https://github.com/okfn/datapipes/issues/2)
* [Proposed Operations issue](https://github.com/okfn/datapipes/issues/9)

Probable operations - see [this issue](https://github.com/okfn/datapipes/issues/9) but as examples:

* delete = delete rows
* cut = select columns
* grep = filter
* head / tail / delete
* sed (note sed 3d = delete ...)


## Potential additional features

* Allow arbitrary map functions
* Run JS scripts from explorer.okfnlabs.org
* View support
* Conversion
* Async (run on a queue)

## Copyright and License

Copyright 2013 Open Knowledge Foundation and Contributors.

Licensed under the MIT license:

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.


