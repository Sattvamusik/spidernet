#!/bin/bash
# Start SpiderSync on Linux
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
python3 "$DIR/../spidersync.py"
