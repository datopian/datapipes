# Streaming Online Data Transformation!

Data Pipes is a service to provide streaming, "pipe-like" data transformations on the web &ndash; things like deleting rows or columns, find and replace, head, grep etc.

To illustrate here's a live example:

[/csv/head -n 50/cut 0/delete 1:7/grep -i London/html?url=https&#58;//raw.github.com/okfn/datapipes/master/test/data/gla.csv][ex]

[ex]: /csv/head%20-n%2050/cut%200/delete%201:7/grep%20-i%20London/html?url=https://raw.github.com/okfn/datapipes/master/test/data/gla.csv

Crudely this does the following: parses the incoming url as CSV, slices out the first 50 rows ([head][]), then cuts column 0 ([cut][]), then deletes rows 1-5 ([delete][]), then filters for all rows with London (case-insensitive) in them ([grep][]), and finally transforms to HTML output ([html][]).

## API

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
* [html][] = render as viewable HTML table
* [delete][] = delete rows
* [head][] = take only first X rows
* [tail][] = take only last X rows
* [strip][] = delete all blank rows
* [cut][] = select / delete columns
* [grep][] = filter rows based on pattern matching
* sed = find and replace (not yet implemented)

[none]: /none/
[csv]: /csv/
[delete]: /delete/
[grep]: /grep/
[head]: /head/
[tail]: /tail/
[strip]: /strip/
[html]: /html/
[cut]: /cut/

<h2 id="contributing">Contributing</h2>

Under the hood Data Pipes is a simple open-source node.js webapp living [here on github][source].

It's super easy to contribute and here are some of the [current issues][issues].

[source]: https://github.com/okfn/datapipes
[issues]: https://github.com/okfn/datapipes/issues

