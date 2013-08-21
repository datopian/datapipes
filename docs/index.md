# Streaming Online Data Transformation!

Data Pipes is a service to provide streaming, "pipe-like" data transformations on the web &ndash; things like deleting rows or columns, find and replace, head, grep etc.

At present we **only handle CSV files** &ndash; they stream very naturally!

*(Interested in [JSON support then vote here][json-issue])*

[json-issue]: https://github.com/okfn/datapipes/issues/16

## API

The basic API is of the form:

    /csv/{transform} {args}/?url={source-url}&other-options...

For example, here is a head operation which shows first n rows or a file (default case with no arguments will show first 10 lines):

    /csv/head/?url={source-url}

With arguments (showing first 20 rows):

    /csv/head -n 20/?url={source-url}

### Piping

You can also do **piping**, that is pass output of one transformation as input to another:

    /csv/{trans1} {args}/{trans2} {args}/.../?url={source-url}

Here, the result of each transform is piped to the next one. Here's an
example:

    /csv/head -n 35/delete 1-5/grep LONDON/html?url=...

Crudely this says: slice out the first 35 rows, then delete rows 1-5, then
filter for all rows with LONDON in them, and finally transform to HTML output.

### CORS and JS web apps

CORS is supported so you can use this from pure JS web apps.

## Transform Operations

The basic operations are inspired by unix-style commands such `head`, `cut`, `grep`, `sed` but really anything a map function can do could be supported ([suggest new operations here][suggest]).

[suggest]: https://github.com/okfn/datapipes/issues

* [none](/csv/none/) (aka raw) = no transform (file parsed) - still useful (see docs)
* [html](/csv/html/) = render as viewable HTML table
* [delete](/csv/delete/) = delete rows
* [head](/csv/head/) = take only first X rows
* cut = select columns (not yet implemented)
* [grep](/csv/grep/) = filter rows based on pattern matching
* sed = find and replace (not yet implemented)

<h2 id="contributing">Contributing</h2>

Under the hood Data Pipes is a simple open-source node.js webapp living [here on github][source].

It's super easy to contribute and here are some of the[ current issues][issues].

[source]: https://github.com/okfn/datapipes
[issues]: https://github.com/okfn/datapipes/issues

