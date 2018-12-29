import os, errno, time, requests
 
bufferSize = 1024;
PATH = "filename";
lynx = "http://lynx.cs.binghamton.edu:8000"

while 1:
	if os.path.isfile(PATH) :
		pipe = open(PATH, "r");
		filename = pipe.read();
		pipe.close();
		os.remove(PATH);
		if filename:
			print(filename);
			filename = filename.rstrip()
			form = {'command':'lineLength'}
			file = {'file':(filename, open(filename, 'rb'))}
			r = requests.post(url=lynx, data=form, files=file);
			with open("../output/" + filename, "wb") as written:
				written.write(r.content)
		
	#Other functions
	# print("Sleep 500 ms")
	time.sleep(1);
