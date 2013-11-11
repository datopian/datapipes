## tail

Simple tail operation:

    # Defaults to last 10 rows
    /csv/tail/?url=...

    # Explicit set number of rows to take using -n option
    #
    # Take last 30 rows
    /csv/tail -n 30/?url=...

    # Take all rows after the first 30
    /csv/tail -n +30/?url=...

### Examples

</csv/tail/?url=https://raw.github.com/datasets/bond-yields-uk-10y/master/annual.csv>


</csv/tail%20-n%2020/?url=https://raw.github.com/datasets/bond-yields-uk-10y/master/annual.csv>

