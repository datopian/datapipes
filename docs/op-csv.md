## csv

Parse or render csv

### Usage

    csv [-tHS] [-d DELIMITER] [-p ESCAPECHAR] [-q QUOTECHAR]

    -t, --tabs
        Indicate the data being parsed or rendered is
        tab-delimited.

    -H, --no-header-row
        On parse, indicate that the first row of the data is
        not a header row.
        On render, this switch is not valid and has no effect.

    -S, --skipinitialspace
        Ignore whitespace immediately following the delimiter.

    -d DELIMITER, --delimiter DELIMITER
        Delimiting character for the data. Defaults to comma.

    -p ESCAPECHAR, --escapechar ESCAPECHAR
        Character used to escape the quote character. Defaults
        to backslash.

    -q QUOTECHAR, --quotechar QUOTECHAR
        Character used to quote strings.

### Examples

Turn comma-delimited data to tab-delimited.

<a href="/csv/csv -t/?url=http://static.london.gov.uk/gla/expenditure/docs/2012-13-P12-250.csv">/csv/csv -t/?url=http://static.london.gov.uk/gla/expenditure/docs/2012-13-P12-250.csv</a>
