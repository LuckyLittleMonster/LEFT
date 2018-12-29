#!/usr/bin/env python3
import requests

lynx = "http://lynx.cs.binghamton.edu:8000"

r = requests.get(url=lynx);
print(r.text)