import glob
import os

script_dir = os.path.dirname(__file__)
rel_path = "memCakes/*.png"
abs_file_path = os.path.join(script_dir, rel_path)

file_names = []


for filepath in glob.iglob(abs_file_path):
  file_names.append(filepath.split("\\")[-1])

print(file_names)