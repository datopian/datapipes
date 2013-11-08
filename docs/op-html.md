## html

Convert the data to an elegant HTML table (with line numbers!).

<form action="/csv/html" method="GET" class="form">
  <input type="text" name="url" value="" placeholder="Post your URL here" style="width: 100%" />
  <button type="submit">Go &raquo;</button>
</form>
<br />

### API

    html/?url=...

You can highlight line numbers:

    html/?url=...#L10

### Examples

S&P 500 companies:

</csv/html/?url=https://raw.github.com/datasets/s-and-p-500-companies/master/data/constituents-financials.csv>

Highlight a line:

</csv/html/?url=https://raw.github.com/datasets/s-and-p-500-companies/master/data/constituents-financials.csv#L110>

