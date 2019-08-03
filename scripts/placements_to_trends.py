#!/usr/bin/env python3

from config import uri
import pymongo
import json

def main():
	client = pymongo.MongoClient(uri)
	db = client.production
	placements = db.placements.find({ })
	wpn_dict = json.loads(open('weapon_info.json').read())
	
	trends = {}
	modes = {1: "SZ", 2: "TC", 3: "RM", 4: "CB"}
	for p in placements:
		year = p['year']
		weapon = p['weapon']
		mode = modes[p['mode']]
		month = p['month']
		weapon_obj = trends.get(weapon, {})
		year_obj = weapon_obj.get(year, {"SZ": [None,0,0,0,0,0,0,0,0,0,0,0,0], "TC": [None,0,0,0,0,0,0,0,0,0,0,0,0], "RM": [None,0,0,0,0,0,0,0,0,0,0,0,0], "CB": [None,0,0,0,0,0,0,0,0,0,0,0,0]})
		year_obj[mode][month] = year_obj[mode][month] + 1
		weapon_obj[year] = year_obj
		trends[weapon] = weapon_obj
		
		sub = wpn_dict[weapon]["Sub"]
		special = wpn_dict[weapon]["Special"]
		
		weapon_obj = trends.get(sub, {})
		year_obj = weapon_obj.get(year, {"SZ": [None,0,0,0,0,0,0,0,0,0,0,0,0], "TC": [None,0,0,0,0,0,0,0,0,0,0,0,0], "RM": [None,0,0,0,0,0,0,0,0,0,0,0,0], "CB": [None,0,0,0,0,0,0,0,0,0,0,0,0]})
		year_obj[mode][month] = year_obj[mode][month] + 1
		weapon_obj[year] = year_obj
		trends[sub] = weapon_obj
		
		weapon_obj = trends.get(special, {})
		year_obj = weapon_obj.get(year, {"SZ": [None,0,0,0,0,0,0,0,0,0,0,0,0], "TC": [None,0,0,0,0,0,0,0,0,0,0,0,0], "RM": [None,0,0,0,0,0,0,0,0,0,0,0,0], "CB": [None,0,0,0,0,0,0,0,0,0,0,0,0]})
		year_obj[mode][month] = year_obj[mode][month] + 1
		weapon_obj[year] = year_obj
		trends[special] = weapon_obj
	
	to_bulk_add = []
		
	for key in trends:
		trend_obj = {"weapon": key, "counts": []}
		for i in range(2018, 2024):
			if i in trends[key]:
				modes_obj = trends[key][i]
				modes_obj["year"] = i
				trend_obj['counts'].append(modes_obj)
		to_bulk_add.append(trend_obj)
		
	db.trends.insert_many(to_bulk_add)
	print("done")

if __name__ == "__main__":
    main()