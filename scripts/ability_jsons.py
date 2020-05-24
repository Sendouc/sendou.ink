# this script parses data from pulled version of https://github.com/Leanny/leanny.github.io to jsons that fit our use case

import urllib.request, json
import os
import glob

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

special_power_keys = {
    "mBurst_PaintR": "Paint Radius",  # missiles
    "mTargetInCircleRadius": "Circle Radius",  # missiles
    "mEnergyAbsorbFrm": "Armor Wind Up Time",  # armor
    "mPaintGauge_SpecialFrm": "Special Duration Time",  # generic duration
    "mBurst_SplashPaintR": "Splash Paint Radius",  # inkjet
    "mBurst_SplashVelL": "Splash Velocity L",
    "mBurst_SplashVelH": "Splash Velocity H",
    # "mBurst_Landing_AddHeight": "Additional High", unused probably splashdown values
    # "mBurst_Landing_AddHeight_SJ": "Additional High (Super Jump)",
    "mRainAreaFrame": "Rain Duration",  # ink storm
    "mBurst_Radius_Near": "Explosion Radius (Near)",
    "mBurst_Radius_Middle": "Explosion Radius (Middle)",
    # "mBurst_Radius_Near": "Explosion Radius (Near)", # baller commented out because currently unchanged by SPU
    "mHP": "HP",  # baller
    "mBombCoreRadiusRate": "Bubble Size Radius Rate",  # bubble blower
    "mCollisionPlayerRadiusMax": "Explosion Effect Radius",  # bubble blower
    "mChargeRtAutoIncr": "Booyah Charge Speed",  # booyah charge speed
}

sub_power_keys = [
    "mPeriod",
    "mMarking",
    "mPlayerColRadius",
    "mMaxHp",
    "mSubRt_Effect_ActualCnt_",
]

sub_internal_english = {
    "JumpBeacon": "Squid Beakon",
    "Shield": "Splash Wall",
    "Trap": "Ink Mine",
    "BombPointSensor": "Point Sensor",
    "Sprinkler": "Sprinkler",
}

rel_path = "leanny.github.io/data/Parameter/latest/WeaponBullet/*.json"
abs_file_path = os.path.join(script_dir, rel_path)
for filepath in glob.iglob(abs_file_path):  # iterate through .json files
    is_bomb = False
    if "Bomb" in filepath and "Launcher" not in filepath:
        is_bomb = True
    with open(filepath) as f:
        data = json.loads(f.read())
        weapon_internal = (
            filepath.replace(
                "leanny.github.io/data/Parameter/latest/WeaponBullet\\", ""
            )
            .replace(".json", "")
            .replace("_2", "")
        )
        for key in data["param"]:
            if (
                "InkConsume" in key
                and "Coop" not in key
                and "Rival" not in key
                and "Tutorial" not in key
                and "LastBoss" not in key
                and "Enemy" not in key
                and "Mission" not in key
                and key != "mInkConsumeRate"  # toxic mist
                and key != "mSideStepInkConsumeScale"  # toxic mist
                and key
                != "mMaxChargeInkConsume"  # used to calculate how much charger consumes if shot mid-charge
                and "mInkConsumeCore"  # comment out to include roller rolling
                not in key
                and not is_bomb
            ):

                append_to_key = ""

                if "_Stand" in weapon_internal:
                    append_to_key = "Stand"
                    weapon_internal = weapon_internal.replace("_Stand", "")

                if "_Jump" in weapon_internal:
                    append_to_key = "Jump"
                    weapon_internal = weapon_internal.replace("_Jump", "")

                if "Repeat" in weapon_internal:
                    append_to_key = "Repeat"
                    weapon_internal = weapon_internal.replace("Repeat", "")

                for englishWeapon, wDict in weapon_dict.items():
                    if weapon_internal in wDict["Name"].replace("_", ""):
                        wDict[f"{key}{append_to_key}"] = data["param"][key]

            for SPU_key in special_power_keys:
                if (
                    SPU_key in key
                    and weapon_internal != "Gachihoko"
                    and weapon_internal != "Trap"
                    and weapon_internal != "Cannon"
                    and not is_bomb
                ):
                    if "Launcher" in weapon_internal:
                        weapon_internal = "Launcher" + weapon_internal.replace(
                            "Bomb", ""
                        ).replace("Launcher", "")
                    translated_special = lang_dict[weapon_internal]

                    obj = weapon_dict.get(translated_special, {"Name": weapon_internal})
                    obj[key] = data["param"][key]
                    weapon_dict[translated_special] = obj

            for BRU_key in sub_power_keys:
                if BRU_key in key and weapon_internal in sub_internal_english.keys():
                    translated_sub = sub_internal_english[weapon_internal]
                    obj = weapon_dict.get(translated_sub, {"Name": weapon_internal})
                    obj[key] = data["param"][key]
                    weapon_dict[translated_sub] = obj


with open("ability_jsons_output/ability_data.json", "w") as fp:
    json.dump(ability_dict, fp)

with open("ability_jsons_output/weapon_data.json", "w") as fp:
    json.dump(weapon_dict, fp)
