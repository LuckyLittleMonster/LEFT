import os, errno, time, requests
 
bufferSize = 1024;
PATH = "filename";
lynx = "http://lynx.cs.binghamton.edu:8000"
uploadPath = "./"

pipe = os.open(PATH, os.O_RDONLY | os.O_NONBLOCK);
while 1:
	try:
		filename = os.read(pipe,bufferSize);
	except OSError as err:
		if err.errno == 11:
			continue;
		else:
			raise err;
	if filename:
		filename = filename.decode('ASCII')
		print(filename);
		form = {'command':'lineLength'}
		file = {'file':(filename, open(filename, 'rb'))}
		r = requests.post(url=lynx, data=form, files=file);
		print(r.text)
	
	#Other functions
	# print("Sleep 500 ms")
	time.sleep(1);
os.close(pipe);