## grep

    grep {regex}/?url=...

regex = regex to match against. Matches in turn against each column. If any column matches result is true.

### Examples

Return only those rows containing LONDON:

<a href="/csv/grep LONDON?url=http://static.london.gov.uk/gla/expenditure/docs/2012-13-P12-250.csv">/csv/grep LONDON?url=http://static.london.gov.uk/gla/expenditure/docs/2012-13-P12-250.csv</a>

More readable version piped through html:

<a href="/csv/grep LONDON/html/?url=http://static.london.gov.uk/gla/expenditure/docs/2012-13-P12-250.csv">/csv/grep LONDON/html/?url=http://static.london.gov.uk/gla/expenditure/docs/2012-13-P12-250.csv</a>
