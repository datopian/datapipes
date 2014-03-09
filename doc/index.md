# Shareable Simple Data Transformations

Data Pipes is an online service for doing **simple data transformations** on tabular
data – deleting rows and columns, find and replace, filtering, viewing as HTML
– and, furthermore, to **connect these transformations** together Unix pipes style
to make more complex transformations.

Plus: as an online service **to share your pipeline** (and its output data) just
**copy/paste the URL**.

### Quick start

* [View a CSV][html] &ndash; turn a CSV into a nice online HTML table in seconds
* [Pipeline Wizard][wizard] &ndash; create your own Data Pipeline interactively
* [Find out more](#doc) &ndash; including full docs of the API

[wizard]: /wizard/

<a name="doc"></a>

## Example

To illustrate here's an example which shows the power of DataPipes. It shows
DataPipes being used to clean up and display a raw spending data CSV file from
the Greater London Authority.

[http://datapipes.okfnlabs.org/csv/head -n 50/cut 0/delete 1:7/grep -i London/html?url=https&#58;//raw.github.com/okfn/datapipes/master/test/data/gla.csv][ex]

[ex]: /csv/head%20-n%2050/cut%200/delete%201:7/grep%20-i%20London/html?url=https://raw.github.com/okfn/datapipes/master/test/data/gla.csv

This does the following:

* parses the incoming url as CSV
* slices out the first 50 rows (using [head][])
* deletes the first column (using [cut][])
* deletes rows 1-5 (using [delete][])
* then selects those rows with London (case-insensitive) in them (using [grep][])
* finally transforms the output to an HTML table (using [html][])

Here's what the output looks like:

[<img src="http://webshot.okfnlabs.org/api/generate?url=http%3A%2F%2Fdatapipes.okfnlabs.org%2Fcsv%2Fhead%2520-n%252050%2Fcut%25200%2Fdelete%25201%3A7%2Fgrep%2520-i%2520London%2Fhtml%3Furl%3Dhttps%3A%2F%2Fraw.github.com%2Fokfn%2Fdatapipes%2Fmaster%2Ftest%2Fdata%2Fgla.csv&width=800&height=300" style="width: 100%;" />][ex]

<h2 id="api">API</h2>

The basic API is of the form:

    /csv/{transform} {args}/?url={source-url}

For example, here is a head operation which shows first n rows or a file (default case with no arguments will show first 10 lines):

    /csv/head/?url={source-url}

With arguments (showing first 20 rows):

    /csv/head -n 20/?url={source-url}

### Piping

You can also do **piping**, that is pass output of one transformation as input to another:

    /csv/{trans1} {args}/{trans2} {args}/.../?url={source-url}

### Input Formats

At present we only support CSV but we are considering support for JSON, plain text and RSS.

*If you are interested in [JSON support then vote here][json-issue])*

[json-issue]: https://github.com/okfn/datapipes/issues/16

### Query string substitution

Some characters can’t be used in a URL path because of [restrictions][ietf]. If this is a limitation (for instance if you need to use backslashes in your `grep` regex) variables can be defined in the query string and substituted in. E.g.:

    /csv/grep $dt/html/?dt=\d{2}-\d{2}-\d{4}&url={source-url}

[ietf]: http://tools.ietf.org/html/rfc3986

### CORS and JS web apps

CORS is supported so you can use this from pure JS web apps.

## Transform Operations

The basic operations are inspired by unix-style commands such `head`, `cut`, `grep`, `sed` but really anything a map function can do could be supported. ([Suggest new operations here][suggest]).

[suggest]: https://github.com/okfn/datapipes/issues

* [none][] (aka `raw`) = no transform but file parsed (useful with CORS)
* [csv][] = parse / render csv
* [head][] = take only first X rows
* [tail][] = take only last X rows
* [delete][] = delete rows
* [strip][] = delete all blank rows
* [grep][] = filter rows based on pattern matching
* [cut][] = select / delete columns
* [replace][] = find and replace (not yet implemented)
* [html][] = render as viewable HTML table

[none]: /none/
[csv]: /csv/
[head]: /head/
[tail]: /tail/
[delete]: /delete/
[strip]: /strip/
[grep]: /grep/
[cut]: /cut/
[replace]: /replace/
[html]: /html/

<h2 id="contributing">Contributing</h2>

Under the hood Data Pipes is a simple open-source node.js webapp living [here on github][source].

It's super easy to contribute and here are some of the [current issues][issues].

[source]: https://github.com/okfn/datapipes
[issues]: https://github.com/okfn/datapipes/issues

