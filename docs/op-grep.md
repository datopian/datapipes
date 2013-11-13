## grep

Filter data to only those rows where certain columns match a regular expression.

### Usage

    grep [-v] [-e pattern] [-c columns] [PATTERN]/?url…

    -c COLUMNS, --columns COLUMNS
        comma-separated list of columns to search.

    -e PATTERN, --regexp PATTERN
        The regular expression to search for.

    -v, --invert-match
        Return the rows that do __not__ match the regular
        expression.

### Examples

Return only those rows containing LONDON:

<a href="/csv/grep LONDON?url=http://static.london.gov.uk/gla/expenditure/docs/2012-13-P12-250.csv">/csv/grep LONDON?url=http://static.london.gov.uk/gla/expenditure/docs/2012-13-P12-250.csv</a>

Return only those rows that do __not__ mention LONDON (piped through html):

<a href="/csv/grep -v LONDON/html/?url=http://static.london.gov.uk/gla/expenditure/docs/2012-13-P12-250.csv">/csv/grep -v LONDON/html/?url=http://static.london.gov.uk/gla/expenditure/docs/2012-13-P12-250.csv</a>
