## tail

Truncate dataset to its last rows.

### Usage

    tail [-n COUNT]/?url…

    -n COUNT
        Number of rows to truncate to. If this option is
        omitted, it defaults to 10.

        A leading + sign means this number is relative to
        the first row. Otherwise it is relative to the last
        row.

### Examples

Return the last 10 rows.

</csv/tail/?url=https://raw.github.com/datasets/bond-yields-uk-10y/master/annual.csv>

Return all rows after the first 5.

[/csv/tail -n +5/?url=https://raw.github.com/datasets/bond-yields-uk-10y/master/annual.csv](/csv/tail -n +5/?url=https://raw.github.com/datasets/bond-yields-uk-10y/master/annual.csv)
