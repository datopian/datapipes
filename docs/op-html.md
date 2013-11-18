## html

Convert the data to an elegant HTML table (with line numbers!).

<form action="" method="GET" class="form">
  <input type="text" name="url" value="" placeholder="Post your URL here" style="width: 100%" />
  <button type="submit">Go &raquo;</button>
</form>
<br />

### Usage

    html [-H]

    -H, --no-header-row
        By default, the first row of data is rendered as a
        header row. This switch disables that behaviour.

        If the first row was parsed as a header row, this
        switch is not valid and will have no effect.

You can also highlight lines by their line numbers:

    html/?url=...#L10

### Examples

S&P 500 companies:

</csv/html/?url=https://raw.github.com/datasets/s-and-p-500-companies/master/data/constituents-financials.csv>

Highlight a line:

</csv/html/?url=https://raw.github.com/datasets/s-and-p-500-companies/master/data/constituents-financials.csv#L110>

