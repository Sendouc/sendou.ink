import glob
import os
import pymongo
from config import uri

# I know you could do a lot of the stuff below more efficiently but I don't think it matters in this case :)

maps = ["The Reef",
"Musselforge Fitness",
"Starfish Mainstage",
"Humpback Pump Track",
"Inkblot Art Academy",
"Sturgeon Shipyard",
"Moray Towers",
"Port Mackerel",
"Manta Maria",
"Kelp Dome",
"Snapper Canal",
"Blackbelly Skatepark",
"MakoMart",
"Walleye Warehouse",
"Shellendorf Institute",
"Arowana Mall",
"Goby Arena",
"Piranha Pit",
"Camp Triggerfish",
"Wahoo World",
"New Albacore Hotel",
"Ancho-V Games",
"Skipper Pavilion"]

client = pymongo.MongoClient(uri)
db = client.production

script_dir = os.path.dirname(__file__)
file_name = input('Enter the file name without extension: ')
rel_path = f"maps/{file_name}.txt"
abs_file_path = os.path.join(script_dir, rel_path)

with open(abs_file_path) as f:
  content = f.read().split("\n")

for index, line in enumerate(content[:]):
  if line != "":
    content[index] = content[index].strip()
    content[index] = ' '.join(content[index].split())

counter = 0
for line in content[1:]: # validate data
  if line not in maps and line != "":
    raise ValueError(f'{line} is not a valid map name.')
  if line == "" and "ranked" in content[0].lower():
    if counter != 0 and counter != 8:
      raise ValueError(f'For ranked rotations there should be 8 maps per got. Got: {counter}')
    counter = 0

  if line != "":
    counter += 1

map_list_name = content[0]
sz = []
tc = []
rm = []
cb = []
index = 0
modes = [sz, tc, rm, cb]
modes_sorted = [[], [], [], []]

for line in content[2:]:
  if line == "":
    index += 1
    continue
  modes[index].append(line)

for mode in modes:
  if len(mode) != len(set(mode)):
    raise ValueError(f'Duplicate map in mode {mode}.')

for m in maps:
  for i in range(0, 4):
    if m in modes[i]:
      modes_sorted[i].append(m)

map_object = {"name": map_list_name, "sz": modes_sorted[0], "tc": modes_sorted[1], "rm": modes_sorted[2], "cb": modes_sorted[3]}
db.maplists.insert_one(map_object)

print('Success! Entered the following map list to the database:')
print(map_object)