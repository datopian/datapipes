# Streaming Online Data Transformation!

Data Pipes is a service to provide streaming, "pipe-like" data transformations on the web &ndash; things like deleting rows or columns, find and replace, head, grep etc.

At present we **only handle CSV files** &ndash; they stream very naturally!

*(Interested in [JSON support then vote here][json-issue])*

[json-issue]: https://github.com/okfn/datapipes/issues/16

## API

The API is of the form:

    /csv/{operation}/?url={source-url}&other-options ...

CORS is supported so you can use this from pure JS web apps.

## Transform Operations

The basic operations are inspired by unix-style commands such `head`, `cut`, `grep`, `sed` but really anything a map function can do could be supported ([suggest new operations here][suggest]).

[suggest]: https://github.com/okfn/datapipes/issues

* [none](/csv/none/) (aka raw) = no transform (though file parsed)
* [html](/csv/html/) = render as viewable HTML table
* [delete](/csv/delete/) = delete rows
* [head](/csv/head/) = take only first X rows
* cut = select columns (not yet implemented)
* grep = filter (not yet implemented)
* sed = find and replace (not yet implemented)

<h2 id="contributing">Contributing</h2>

Under the hood Data Pipes is a simple open-source node.js webapp living [here on github][source].

It's super easy to contribute and here are some of the[ current issues][issues].

[source]: https://github.com/okfn/datapipes
[issues]: https://github.com/okfn/datapipes/issues

