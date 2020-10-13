#!/usr/bin/env python3
import sys
print(*[arg.encode().decode('unicode-escape') for arg in sys.argv[1:]])
