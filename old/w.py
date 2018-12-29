import os, errno, time, requests
 
bufferSize = 1024;
PATH = "filename";
f = "ff"

piper = os.open(PATH, os.O_RDONLY | os.O_NONBLOCK);

pipe = os.open(PATH, os.O_WRONLY);
os.write(pipe,f.encode('ASCII'));

time.sleep(10);
os.close(pipe);

