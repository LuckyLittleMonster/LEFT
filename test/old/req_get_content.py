#!/usr/bin/env python3
import requests

lynx = "http://lynx.cs.binghamton.edu/output/lineLength_test2.txt"

r = requests.get(url=lynx);
print(r.content)