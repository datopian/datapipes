Perform streaming data transformations on local and online csv files.

Usage: $0 [-s] DATA [PIPELINE OF OPERATIONS ...]

  DATA     the file path or URL to the data you want to pass through the
           data pipeline. If you want to use stdin use '_' (underscore)

  PIPELINE is the series of operations which will be applied to the input data.
           The PIPELINE can be specified in 2 ways on the command line.
  
           A. in the form like that used online: a single string with
           operations separated by '/' e.g.

           "/delete 1/grep abc/head"

           B. as individual operations separated by spaces (ie. classic
           positional arguments)

           "delete 1" "grep abc" head 

           Available operations are listed below.

Operations
==========

{{Operations}}

Examples
========

    $0 data.csv head
    $0 data.csv "delete 2" head 
    $0 data.csv "/delete 2/head/" 

