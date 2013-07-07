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

