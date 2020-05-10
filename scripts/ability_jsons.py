import urllib.request, json

with open("lang_dict_EUen.json") as f:
    lang_dict = json.load(f)

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

print_dict = {}

for code in ability_jsons:
    with urllib.request.urlopen(
        f"https://raw.githubusercontent.com/Leanny/leanny.github.io/master/data/Parameter/latest/Player/Player_Spec_{code}.json"
    ) as url:
        data = json.loads(url.read().decode())
        print_dict[lang_dict[code]] = data[code]

weapon_dict = {}

with urllib.request.urlopen(
    "https://raw.githubusercontent.com/Leanny/leanny.github.io/master/data/Mush/latest/WeaponInfo_Main.json"
) as url:
    data = json.loads(url.read().decode())
    for weapon_obj in data:
        weapon_dict[lang_dict[weapon_obj["Name"]]] = weapon_obj

with urllib.request.urlopen(
    "https://raw.githubusercontent.com/Leanny/leanny.github.io/master/data/Mush/latest/WeaponInfo_Sub.json"
) as url:
    data = json.loads(url.read().decode())
    for weapon_obj in data:
        if weapon_obj["Name"] in lang_dict:
            weapon_dict[lang_dict[weapon_obj["Name"]]] = weapon_obj

with open("ability_jsons_output/ability_data.json", "w") as fp:
    json.dump(print_dict, fp)

with open("ability_jsons_output/weapon_data.json", "w") as fp:
    json.dump(weapon_dict, fp)
