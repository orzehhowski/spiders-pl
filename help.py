import os

def printFile(uno, dos=""):
    if (dos):
        print(f"\"./src/{dos}/{uno}\",")
    else:
        print(f"\"./src/{uno}\",")

print("[")
for file in os.listdir("./src"):
    if file[-3:] != ".ts":
        for nested in os.listdir(f"./src/{file}"):
            printFile(nested, file)
    else:
        printFile(file)
print("]")