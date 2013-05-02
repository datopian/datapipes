Data Pipes = Unix Data Tools x CSV x Web

Web service to provide unix-style `cut`, `grep`, `sed` in a streaming, "pipe-like" manner.

At the moment we operate on CSV files only (plain txt perhaps coming soon ...).

## Examples

Do nothing:

    /csv/null/?url=file.csv

Delete the first 3 lines of this csv file:

    /csv/delete/?range=0-3&url=abc

## Operations

### delete

    .../delete/?range={...}

range = comma separated range of row indices e.g.

    1
    1,2,5
    1:5,10:15
    1,3,5:10

### Planned

Not yet implemented ...

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

