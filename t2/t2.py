import os

rt = os.system("./login h1 p1")
print(rt);

rt = os.system("./login h2 p2")
print(rt);
rt = os.system("./reg h2 p2")
print(rt);
rt = os.system("./login h2 p2")
print(rt);
rt = os.system("./mod h2 p1 p2")
print(rt);
rt = os.system("./mod h2 p2 p3")
print(rt);