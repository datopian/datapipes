## map

Apply a user-defined operator

### Usage

    map [URL]

    URL
        Location of the code of the operator.

### Operator definition

Operators consist of two functions:

 * `transform(input)`, which accepts the current line of data, and returns the processed line.
 * `flush()`, which is called after all the data has been passed through.

This [uppercase operator](https://gist.github.com/andylolz/7794290) serves as an example.

### Examples

[/csv/map $map/html?map=https://gist.github.com/andylolz/7794290/raw/8e88a5daac9a6496a8397dad99e14f18ed5ab378/uppercase.js&url=https://raw.github.com/okfn/datapipes/master/test/data/gla.csv](/csv/map%20$map/html?map=https://gist.github.com/andylolz/7794290/raw/8e88a5daac9a6496a8397dad99e14f18ed5ab378/uppercase.js&url=https://raw.github.com/okfn/datapipes/master/test/data/gla.csv)
