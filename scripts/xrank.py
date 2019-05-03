import glob
import os
import json
import calendar
import pymongo
from config import uri

shooters = ["Sploosh-o-matic", "Neo Sploosh-o-matic", "Sploosh-o-matic 7",
"Splattershot Jr.", "Custom Splattershot Jr.", "Kensa Splattershot Jr.",
"Splash-o-matic", "Neo Splash-o-matic", "Aerospray MG", "Aerospray RG",
"Aerospray PG", "Splattershot", "Tentatek Splattershot", "Kensa Splattershot",
".52 Gal", ".52 Gal Deco", "Kensa .52 Gal", "N-ZAP '85", "N-ZAP '89",
"N-ZAP '83", "Splattershot Pro", "Forge Splattershot Pro", "Kensa Splattershot Pro",
".96 Gal", ".96 Gal Deco", "Jet Squelcher", "Custom Jet Squelcher",
"L-3 Nozzlenose", "L-3 Nozzlenose D", "Kensa L-3 Nozzlenose",
"H-3 Nozzlenose", "H-3 Nozzlenose D", "Cherry H-3 Nozzlenose", "Squeezer",
"Foil Squeezer"]

blasters = ["Luna Blaster", "Luna Blaster Neo", "Kensa Luna Blaster",
"Blaster", "Custom Blaster", "Range Blaster", "Custom Range Blaster",
"Grim Range Blaster", "Rapid Blaster", "Rapid Blaster Deco", "Kensa Rapid Blaster",
"Rapid Blaster Pro", "Rapid Blaster Pro Deco", "Clash Blaster", "Clash Blaster Neo"]

rollers = ["Carbon Roller", "Carbon Roller Deco", "Splat Roller", "Krak-On Splat Roller",
"Kensa Splat Roller", "Dynamo Roller", "Gold Dynamo Roller", "Kensa Dynamo Roller",
"Flingza Roller", "Foil Flingza Roller", "Inkbrush", "Inkbrush Nouveau",
"Permanent Inkbrush", "Octobrush", "Octobrush Nouveau", "Kensa Octobrush"]

chargers = ["Classic Squiffer", "New Squiffer", "Fresh Squiffer", "Splat Charger",
"Firefin Splat Charger", "Kensa Charger", "Splatterscope", "Firefin Splatterscope",
"Kensa Splatterscope", "E-liter 4K", "Custom E-liter 4K", "E-liter 4K Scope",
"Custom E-liter 4K Scope", "Bamboozler 14 Mk I", "Bamboozler 14 Mk II",
"Bamboozler 14 Mk III", "Goo Tuber", "Custom Goo Tuber"]

sloshers = ["Slosher", "Slosher Deco", "Soda Slosher", "Tri-Slosher",
"Tri-Slosher Nouveau", "Sloshing Machine", "Sloshing Machine Neo",
"Kensa Sloshing Machine", "Bloblobber", "Bloblobber Deco", "Explosher",
"Custom Explosher"]

splatlings = ["Mini Splatling", "Zink Mini Splatling", "Kensa Mini Splatling",
"Heavy Splatling", "Heavy Splatling Deco", "Heavy Splatling Remix",
"Hydra Splatling", "Custom Hydra Splatling", "Ballpoint Splatling",
"Ballpoint Splatling Nouveau", "Nautilus 47", "Nautilus 79"]

dualies = ["Dapple Dualies", "Dapple Dualies Nouveau", "Clear Dapple Dualies",
"Splat Dualies", "Enperry Splat Dualies", "Kensa Splat Dualies", "Glooga Dualies",
"Glooga Dualies Deco", "Kensa Glooga Dualies", "Dualie Squelchers",
"Custom Dualie Squelchers", "Dark Tetra Dualies", "Light Tetra Dualies"]

brellas = ["Splat Brella", "Sorella Brella", "Tenta Brella", "Tenta Sorella Brella",
"Tenta Camo Brella", "Undercover Brella", "Undercover Sorella Brella", "Kensa Undercover Brella"]

client = pymongo.MongoClient(uri)
db = client.production

script_dir = os.path.dirname(__file__)
rel_path = "xrank_data/*.json"
abs_file_path = os.path.join(script_dir, rel_path)

year = 2019 # needs to be updated manually when we process data from different years

def resolve_top_array(key_name, player, result, x_power):
  if key_name not in player:
    player[key_name] = [result.inserted_id]
  else:
    if len(player[key_name]) <= 3:
      player[key_name].append(result.inserted_id)
    else:
      lowest_power = 10000
      lowest_power_index = -1
      sum_of_powers = x_power
      for index, placement_id in enumerate(player[key_name]):
        high_placement = db.placements.find_one({ "_id": placement_id })
        if high_placement is None:
          raise ValueError(f'Placement id {placement_id} not found in the database.')
        sum_of_powers += high_placement["x_power"]
        if high_placement["x_power"] < x_power:
          if high_placement["x_power"] < lowest_power:
            lowest_power = high_placement["x_power"]
            lowest_power_index = index
      
      if lowest_power_index != -1:
        player[key_name][lowest_power_index] = result.inserted_id
        sum_of_powers -= lowest_power
        power_score = round((sum_of_powers / 4), 1)
        player[f"{key_name}Score"] = power_score
  return player

for filepath in glob.iglob(abs_file_path): # iterate through .json files in the xrank_data folder
  if filepath.endswith(".json"):
    path_without_folder = filepath.replace("xrank_data\\", "")
    file_parts = path_without_folder.split("_")
    print(path_without_folder)
    month = list(calendar.month_name).index(file_parts[0].capitalize())

    if "splat" in file_parts[1]:
      mode = 1
    elif "tower" in file_parts[1]:
      mode = 2
    elif "rainmaker" in file_parts[1]:
      mode = 3
    else:
      mode = 4
    with open(filepath) as f:
      data = json.load(f)
      for placement in data:
        if placement["cheater"]:
          continue

        rank = placement["rank"]
        if rank > 500:
          break
        
        name = placement["name"]
        x_power = placement["x_power"]
        unique_id = placement["unique_id"]

        weapon = placement["weapon"]["name"].strip()
        # If weapon is one of the reskins it gets converted to the regular version
        if weapon == "Hero Shot Replica":
          weapon = "Splattershot"
        elif weapon == "Octo Shot Replica":
          weapon = "Tentatek Splattershot"
        elif weapon == "Hero Blaster Replica":
          weapon = "Blaster"
        elif weapon == "Hero Roller Replica":
          weapon = "Splat Roller"
        elif weapon == "Herobrush Replica":
          weapon = "Octobrush"
        elif weapon == "Hero Charger Replica":
          weapon = "Splat Charger"
        elif weapon == "Hero Slosher Replica":
          weapon = "Slosher"
        elif weapon == "Hero Splatling Replica":
          weapon = "Heavy Splatling"
        elif weapon == "Hero Dualie Replicas":
          weapon = "Splat Dualies"
        elif weapon == "Hero Brella Replica":
          weapon = "Splat Brella"

        print(f"{month} {year} - {mode} - {name} {unique_id} {rank} {x_power} {weapon}")

        placement_document = {"name": name,
                              "weapon": weapon,
                              "rank": rank,
                              "mode": mode,
                              "x_power": x_power,
                              "unique_id": unique_id,
                              "month": month,
                              "year": year}

        result = db.placements.insert_one(placement_document)

        player = db.players.find_one({ "unique_id": unique_id })

        if player is None:
          player = {"name": name,
          "unique_id": unique_id,
          "weapons": [weapon]}
        else:
          player["name"] = name
          playerWeapons = player["weapons"]
          playerWeapons.append(weapon)
          player["weapons"] = list(dict.fromkeys(playerWeapons))
        
        player = resolve_top_array("topTotal", player, result, x_power)
        
        if weapon in shooters:
          player = resolve_top_array("topShooter", player, result, x_power)
        elif weapon in blasters:
          player = resolve_top_array("topBlaster", player, result, x_power)
        elif weapon in rollers:
          player = resolve_top_array("topRoller", player, result, x_power)
        elif weapon in chargers:
          player = resolve_top_array("topCharger", player, result, x_power)
        elif weapon in sloshers:
          player = resolve_top_array("topSlosher", player, result, x_power)
        elif weapon in splatlings:
          player = resolve_top_array("topSplatling", player, result, x_power)
        elif weapon in dualies:
          player = resolve_top_array("topDualies", player, result, x_power)
        elif weapon in brellas:
          player = resolve_top_array("topBrella", player, result, x_power)
        else:
          raise ValueError(f'Weapon "{weapon}"doesn\'t belong in any category')

        if len(player["topTotal"]) == 1: # if player was just added
          db.players.insert_one(player)
        else:
          db.players.find_one_and_replace({"unique_id": unique_id}, player)

        
