import os


with open("files.txt") as f:
    for line in f:
        if ".js" in line:
            line = line[:-1]
            print(line)
            newline = line.replace(".js", ".ts")
            os.system(f"mv {line} {newline}")
