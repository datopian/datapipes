## replace

Find and replace.

### Usage

    replace [-r] [-c columns] [FIND] [REPLACE]

    -r, --regex
        Find argument is a regular expression.

    -c COLUMNS, --columns COLUMNS
        comma-separated list of columns to search.

    FIND
        Text to search for.

    REPLACE
        Text to replace the found text with.

### Examples

Turn multiple consecutive spaces into a single space.

[/csv/head/replace -r $f $r?f=\s\s*&r=%20&url=https://raw.github.com/okfn/datapipes/master/test/data/gla.csv](/csv/head/replace%20-r%20$f%20$r?f=\s\s*&r=%20&url=https://raw.github.com/okfn/datapipes/master/test/data/gla.csv)
