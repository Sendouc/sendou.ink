import json

weapons = ["Sploosh-o-matic", "Neo Sploosh-o-matic", "Sploosh-o-matic 7",
"Splattershot Jr.", "Custom Splattershot Jr.", "Kensa Splattershot Jr.",
"Splash-o-matic", "Neo Splash-o-matic", "Aerospray MG", "Aerospray RG",
"Aerospray PG", "Splattershot", "Tentatek Splattershot", "Kensa Splattershot",
".52 Gal", ".52 Gal Deco", "Kensa .52 Gal", "N-ZAP '85", "N-ZAP '89",
"N-ZAP '83", "Splattershot Pro", "Forge Splattershot Pro", "Kensa Splattershot Pro",
".96 Gal", ".96 Gal Deco", "Jet Squelcher", "Custom Jet Squelcher",
"L-3 Nozzlenose", "L-3 Nozzlenose D", "Kensa L-3 Nozzlenose",
"H-3 Nozzlenose", "H-3 Nozzlenose D", "Cherry H-3 Nozzlenose", "Squeezer",
"Foil Squeezer",
"Luna Blaster", "Luna Blaster Neo", "Kensa Luna Blaster",
"Blaster", "Custom Blaster", "Range Blaster", "Custom Range Blaster",
"Grim Range Blaster", "Rapid Blaster", "Rapid Blaster Deco", "Kensa Rapid Blaster",
"Rapid Blaster Pro", "Rapid Blaster Pro Deco", "Clash Blaster", "Clash Blaster Neo",
"Carbon Roller", "Carbon Roller Deco", "Splat Roller", "Krak-On Splat Roller",
"Kensa Splat Roller", "Dynamo Roller", "Gold Dynamo Roller", "Kensa Dynamo Roller",
"Flingza Roller", "Foil Flingza Roller", "Inkbrush", "Inkbrush Nouveau",
"Permanent Inkbrush", "Octobrush", "Octobrush Nouveau", "Kensa Octobrush", 
"Classic Squiffer", "New Squiffer", "Fresh Squiffer", "Splat Charger",
"Firefin Splat Charger", "Kensa Charger", "Splatterscope", "Firefin Splatterscope",
"Kensa Splatterscope", "E-liter 4K", "Custom E-liter 4K", "E-liter 4K Scope",
"Custom E-liter 4K Scope", "Bamboozler 14 Mk I", "Bamboozler 14 Mk II",
"Bamboozler 14 Mk III", "Goo Tuber", "Custom Goo Tuber", "Slosher", "Slosher Deco", "Soda Slosher", "Tri-Slosher",
"Tri-Slosher Nouveau", "Sloshing Machine", "Sloshing Machine Neo",
"Kensa Sloshing Machine", "Bloblobber", "Bloblobber Deco", "Explosher",
"Custom Explosher", "Mini Splatling", "Zink Mini Splatling", "Kensa Mini Splatling",
"Heavy Splatling", "Heavy Splatling Deco", "Heavy Splatling Remix",
"Hydra Splatling", "Custom Hydra Splatling", "Ballpoint Splatling",
"Ballpoint Splatling Nouveau", "Nautilus 47", "Nautilus 79", 
"Dapple Dualies", "Dapple Dualies Nouveau", "Clear Dapple Dualies",
"Splat Dualies", "Enperry Splat Dualies", "Kensa Splat Dualies", "Glooga Dualies",
"Glooga Dualies Deco", "Kensa Glooga Dualies", "Dualie Squelchers",
"Custom Dualie Squelchers", "Dark Tetra Dualies", "Light Tetra Dualies", 
"Splat Brella", "Sorella Brella", "Tenta Brella", "Tenta Sorella Brella",
"Tenta Camo Brella", "Undercover Brella", "Undercover Sorella Brella", "Kensa Undercover Brella"]

weapon_info = {}

lang_dict = json.loads(open('lang_dict_EUen.json').read())
wpn_list = json.loads(open('WeaponInfo_Main_5_0.json').read())

for wpn_obj in wpn_list:
	Name = lang_dict[wpn_obj['Name']].strip()
	if Name not in weapons:
		print(Name)
		continue
	Sub = lang_dict[wpn_obj['Sub']]
	Special =  lang_dict[wpn_obj['Special']]
	Range = wpn_obj['Range']
	SpecialCost = wpn_obj['SpecialCost']
	weapon_info[Name] = {"Sub": Sub, "Special": Special, "Range": Range, "SpecialCost": SpecialCost}

with open('weapon_info.json', 'w') as fp:
    json.dump(weapon_info, fp)
	