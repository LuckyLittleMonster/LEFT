#!/usr/bin/env python3
import requests

lynx = "http://lynx.cs.binghamton.edu/"
local = "http://localhost:8000/"

form = {
	'command':'lineLength'
}
file = {
	'file':('test1.txt', open('test1.txt', 'rb'))
}

r = requests.post(url=lynx, data=form, files=file);
print(r.text)