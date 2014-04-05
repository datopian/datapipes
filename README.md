A node library, command line tool and webapp to provide "pipe-able" Unix-Style
data transformations on row-based data like CSVs.

DataPipes offers unix-style `cut`, `grep`, `sed` operations on row-based data
like CSVs in a streaming, connectable "pipe-like" manner.

DataPipes can be used:

* Online at <http://datapipes.okfnlabs.org/>
* Via a command line interface - see below
* As a Node JS library - see below

[![Build
Status](https://travis-ci.org/okfn/datapipes.png)](https://travis-ci.org/okfn/datapipes)

## Install

```
npm install -g datapipes
```

## Usage - Command line

Once installed, `datapipes` will be available on the command line:

    datapipes -h

See the help for usage instructions, but to give a quick taster:

    # head (first 10 rows) of this file
    datapipes https://raw.github.com/datasets/browser-stats/master/data.csv head

    # search for occurrences of London (ignore case) and show first 10 results
    datapipes https://raw.github.com/rgrp/dataset-gla/master/data/all.csv "grep -i london" head

## Usage - Library

See the [Developer
Docs](https://github.com/okfn/datapipes/blob/master/doc/dev.md).

----

## Developers

### Installation

This is a Node Express application. To install and run do the following.

1. Clone this repo
2. Change into the repository base directory
3. Run:

```bash
$ npm install
```

### Testing

Once installed, you can run the tests locally with:

```bash
$ make test
```

### Running

To start the app locally, it’s:

```bash
$ node app.js
```

You can then access it from <http://localhost:5000/>

### Deployment

For deployment we use Heroku.

The primary app is called `datapipes` on Heroku. To add it as a git remote, do:

```bash
$ heroku git:remote -a datapipes
```

Then to deploy:

```bash
$ git push datapipes
```

## Inspirations and Related

* https://github.com/substack/dnode dnode is an asynchronous rpc system for
  node.js that lets you call remote functions. You can pass callbacks to remote
  functions, and the remote end can call the functions you passed in with
  callbacks of its own and so on. It's callbacks all the way down!

## Copyright and License

Copyright 2013-2014 Open Knowledge Foundation and Contributors.

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


