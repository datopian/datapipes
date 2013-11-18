## subs

Find and replace.

### Usage

    subs [-r] [FIND] [REPLACE]

    -r, --regex
        Find argument is a regular expression.

    FIND
        Text to search for.

    REPLACE
        Text to replace the found text with.

### Examples

Turn multiple consecutive spaces into a single space.

[/csv/head/subs -r $f $r?f=\s\s*&r=%20&url=https://raw.github.com/okfn/datapipes/master/test/data/gla.csv](/csv/head/subs%20-r%20$f%20$r?f=\s\s*&r=%20&url=https://raw.github.com/okfn/datapipes/master/test/data/gla.csv)
