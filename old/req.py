#!/usr/bin/env python3
import requests

lynx = "http://lynx.cs.binghamton.edu"

r = requests.get(url=lynx);
print(r.html())