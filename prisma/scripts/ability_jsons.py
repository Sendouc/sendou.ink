# this script parses data from pulled version of https://github.com/Leanny/leanny.github.io to jsons that fit our use case

import urllib.request, json
import os
import glob

with open("lang_dict_EUen.json") as f:
    lang_dict = json.load(f)
    lang_dict["BombPointSensor"] = "Point Sensor"
    lang_dict["BombPoisonFog"] = "Toxic Mist"
    lang_dict["Gachihoko"] = "Rainmaker"
    lang_dict["JumpBeacon"] = "Squid Beakon"

inverted_dict = {v: k for k, v in lang_dict.items()}  # english -> internal

ability_jsons = [
    "BombDamage_Reduction",
    "BombDistance_Up",
    "HumanMove_Up",
    "InkRecovery_Up",
    "JumpTime_Save",
    "MainInk_Save",
    "MarkingTime_Reduction",
    "OpInkEffect_Reduction",
    "RespawnSpecialGauge_Save",
    "RespawnTime_Save",
    "SpecialIncrease_Up",
    "SpecialTime_Up",
    "SquidMove_Up",
    "SubInk_Save",
]

script_dir = os.path.dirname(__file__)

ability_dict = {}

for code in ability_jsons:
    rel_path = f"leanny.github.io/data/Parameter/latest/Player/Player_Spec_{code}.json"
    abs_file_path = os.path.join(script_dir, rel_path)
    with open(abs_file_path) as f:
        data = json.loads(f.read())
        ability_dict[lang_dict[code]] = data[code]

weapon_dict = {}

rel_path = f"leanny.github.io/data/Mush/latest/WeaponInfo_Main.json"
abs_file_path = os.path.join(script_dir, rel_path)
with open(abs_file_path) as f:
    data = json.loads(f.read())
    for weapon_obj in data:
        weapon_obj["Sub"] = lang_dict[weapon_obj["Sub"]]
        weapon_obj["Special"] = lang_dict[weapon_obj["Special"]]
        weapon_dict[lang_dict[weapon_obj["Name"]].strip()] = weapon_obj

rel_path = f"leanny.github.io/data/Mush/latest/WeaponInfo_Sub.json"
abs_file_path = os.path.join(script_dir, rel_path)
with open(abs_file_path) as f:
    data = json.loads(f.read())
    for weapon_obj in data:
        name = weapon_obj["Name"]
        if (
            name in lang_dict
            and "Rival" not in name
            and "LastBoss" not in name
            and "VictoryClam" != name
            and "Mission" not in name
        ):
            normalized_name = name.replace("_", "")
            if normalized_name == "TimerTrap":
                normalized_name = "Trap"
            elif normalized_name == "PoisonFog":
                normalized_name = "BombPoisonFog"
            elif normalized_name == "PointSensor":
                normalized_name = "BombPointSensor"
            elif normalized_name == "Flag":
                normalized_name = "JumpBeacon"
            with urllib.request.urlopen(
                f"https://raw.githubusercontent.com/Leanny/leanny.github.io/master/data/Parameter/latest/WeaponBullet/{normalized_name}.json"
            ) as url2:
                data2 = json.loads(url2.read().decode())
                mInkConsume = data2["param"]["mInkConsume"]
            weapon_obj["mInkConsume"] = mInkConsume
            weapon_dict[lang_dict[weapon_obj["Name"]]] = weapon_obj


def what_to_append(weapon_internal):
    if "_Stand" in weapon_internal:
        return "_Stand"

    if "_Jump" in weapon_internal:
        return "_Jump"

    if "_2" in weapon_internal:
        return "_2"

    if "Repeat" in weapon_internal:
        return "_Repeat"

    if "_Burst" in weapon_internal:
        return "_Burst"

    return ""


rel_path = "leanny.github.io/data/Parameter/latest/WeaponBullet/*.json"
abs_file_path = os.path.join(script_dir, rel_path)
for filepath in glob.iglob(abs_file_path):  # iterate through .json files
    with open(filepath) as f:
        weapon_internal = (
            filepath.replace(
                "leanny.github.io/data/Parameter/latest/WeaponBullet\\", ""
            ).replace(".json", "")
            # .replace("_2", "")
        )
        toAppend = what_to_append(weapon_internal)

        weapon_internal = (
            weapon_internal.replace("_2", "")
            .replace("Repeat", "")
            .replace("_Stand", "")
            .replace("_Jump", "")
            .replace("_Burst", "")
        )

        if "Launcher" in weapon_internal and "Bomb" in weapon_internal:
            weapon_internal = "Launcher" + weapon_internal.replace(
                "Launcher", ""
            ).replace("Bomb", "")

        data = json.loads(f.read())
        data = data["param"]

        if toAppend != "":
            new_data = {}
            for key, value in data.items():
                new_data[f"{key}{toAppend}"] = value

            data = new_data

        did_thing = False
        for english_weapon, wDict in weapon_dict.items():
            if weapon_internal in wDict["Name"].replace("_", ""):
                weapon_dict[english_weapon] = {**wDict, **data}
                did_thing = True

        if not did_thing:
            english = lang_dict.get(weapon_internal, None)
            if english:
                weapon_dict[english] = {**wDict, **data, "Name": english}
                did_thing = True

        values_to_skip = ["BombChase", "ShooterQuickLong", "SuperLaser"]
        if not did_thing:
            if weapon_internal not in values_to_skip:
                raise ValueError(weapon_internal)


with open("ability_jsons_output/ability_data.json", "w") as fp:
    json.dump(ability_dict, fp)

with open("ability_jsons_output/weapon_data.json", "w") as fp:
    json.dump(weapon_dict, fp)
