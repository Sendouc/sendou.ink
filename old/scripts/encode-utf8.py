#!/usr/bin/env python3
import sys
print(*[arg.encode('unicode-escape').decode() for arg in sys.argv[1:]])
