Data Pipes = Unix Data Tools x CSV x Web

Web service to provide unix-style `cut`, `grep`, `sed` in a streaming, "pipe-like" manner.

At the moment we operate on CSV files only (plain txt perhaps coming soon ...).

## API and Usage

This is under discussion and development - see:

* [API structure issue](https://github.com/okfn/datapipes/issues/2)
* [Proposed Operations issue](https://github.com/okfn/datapipes/issues/9)

Some examples:

* Do nothing:

      /csv/null/?url=file.csv

* Delete the first 3 lines of this csv file:

      /csv/delete/?range=0-3&url=abc

Probable operations - see [this issue](https://github.com/okfn/datapipes/issues/9) but as examples:

* delete = delete rows
* cut = select columns
* grep = filter
* head / tail / delete
* sed (note sed 3d = delete ...)

## Operations

### delete

    .../delete/?range={...}

range = comma separated range of row indices e.g.

    1
    1,2,5
    1:5,10:15
    1,3,5:10

## Potential additional features

* Allow arbitrary map functions
* Run JS scripts from explorer.okfnlabs.org
* View support
* Conversion
* Async (run on a queue)

