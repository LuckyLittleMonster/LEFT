import os, errno, time, requests
 
bufferSize = 1024;
PATH = "filename";

pipe = open(PATH, "w");
pipe.write("t.txt");
pipe.close();

