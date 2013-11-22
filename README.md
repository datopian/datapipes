A webapp providing online Unix-Style data transformations on CSVs.

Specifically, it’s a web service which offers unix-style `cut`, `grep`, `sed`
in a streaming, "pipe-like" manner. It can be run via a browser or a command
line interface.

[![Build
Status](https://travis-ci.org/okfn/datapipes.png)](https://travis-ci.org/okfn/datapipes)

## API and Usage

See <http://datapipes.okfnlabs.org/>

## Installation

This is a Node Express application. To install and run do the following.

1. Clone this repo
2. Change into the repository base directory
3. Run:

        npm install

## Testing

Once installed, you can run the tests locally with:

        make test

## Running

To start the app locally, it’s:

        node app.js

You can then access it from <http://localhost:5000/>

## Deployment

For deployment we use Heroku.

The primary app is called `datapipes` on Heroku. To add it as a git remote, do:

    heroku git:remote -a datapipes

Then to deploy:

    git push datapipes

## Inspirations and Related

* https://github.com/substack/dnode dnode is an asynchronous rpc system for
  node.js that lets you call remote functions. You can pass callbacks to remote
  functions, and the remote end can call the functions you passed in with
  callbacks of its own and so on. It's callbacks all the way down!

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


