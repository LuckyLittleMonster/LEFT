#!/usr/bin/env python3
import cgi, cgitb, requests

lynx = "http://lynx.cs.binghamton.edu"

cgitb.enable()

form = cgi.FieldStorage()

r = requests.post(url=lynx, data=form);
print(r)