## cut

Remove specified columns from data.

### Usage

    cut [--complement] [RANGE]

    --complement
        Keep the specified columns, and delete the rest.

    RANGE
        Comma separated column indices (0 based). Ranges can
        also be specified with a colon.

### Examples

Delete the columns 0 and 3 of a CSV file:

<a href="/csv/cut%200,3/?url=http://static.london.gov.uk/gla/expenditure/docs/2012-13-P12-250.csv">/csv/cut 0,3/?url=http://static.london.gov.uk/gla/expenditure/docs/2012-13-P12-250.csv</a>

Delete the columns 1,3 and 5 to 10 of a CSV file:

<a href="/csv/cut%201,3,5:10/?url=http://static.london.gov.uk/gla/expenditure/docs/2012-13-P12-250.csv">/csv/cut 1,3,5:10/?url=http://static.london.gov.uk/gla/expenditure/docs/2012-13-P12-250.csv</a>
