import os
import glob
import shutil

highest_ver = {}

# images from https://mega.nz/folder/3QwygIBL#r9ghq3oeOYmEH0sUIYcMfg
for filepath in glob.iglob("stageImgs/*.png"):
    name = filepath.replace("stageImgs\\", "").replace(".png", "").replace("v", "")

    img_type, map_code, mode, version = name.split(" ")
    if mode in ["TW", "SF"]:
        continue

    code = f"{img_type} {map_code} {mode}"

    version_prev = highest_ver.get(code, "asd asd asd 0").split(" ")[3]

    if int(version) > int(version_prev.replace("v", "").replace(".png", "")):
        highest_ver[code] = filepath

os.mkdir("stageImgs_result")
for filepath in glob.iglob("stageImgs/*.png"):
    for value in highest_ver.values():
        if value == filepath:
            shutil.copy(filepath, "stageImgs_result")

for filepath in glob.iglob("stageImgs_result/*.png"):
    os.rename(filepath, filepath.split(" v")[0] + ".png")
