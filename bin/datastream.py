#!/usr/bin/env python
# -*- coding: utf-8 -*-
from __future__ import print_function, unicode_literals

import sys
from argparse import ArgumentParser

try:
    from urllib.parse import urlencode
except ImportError:
    from urllib import urlencode

description = '''
    command line tool to provide "pipe-able" Unix-Style
    data transformations on row-based data like CSVs.'''

usage = '''
    # head (first 10 rows) of this file
    datapipes https://raw.github.com/datasets/browser-stats/master/data.csv head

    # search for occurrences of London (ignore case) and show first 10 results
    datapipes
    https://raw.github.com/rgrp/dataset-gla/master/data/all.csv
    "grep -i london" head'''

# Argument Parser
parser = ArgumentParser(prog='datastream',
                        usage=usage,
                        description=description)

parser.add_argument('-s',
                    '--share',
                    help='Show help (generic or specific operation)',
                    type=bool)

parser.add_argument()

args = parser.parse_args()

def main():
    if args.share:
        base = 'http://datapipes.okfnlabs.org/'
        url = sys.argv[-1]
        commands = sys.argv[1:-1].split('/')
        return '{init}?url={final}'.format(
            init='/'.join([base, commands]),
            final=urlencode(url))
    else:
        # TODO: Implement
        pass

if __name__ == '__main__':
    sys.exit(main())
