import os, json

codes = ["EUde", "EUes", "EUfr", "EUit", "EUnl", "EUru", "JPja", "EUen", "USes"]
script_dir = os.path.dirname(__file__)

with open("lang_dict_EUen.json") as f:
    lang_dict = json.load(f)

for code in codes:
    rel_path = f"leanny.github.io/data/Languages/lang_dict_{code}.json"
    abs_file_path = os.path.join(script_dir, rel_path)
    with open(abs_file_path) as f:
        data: dict = json.load(f)
        result = {}
        for key, value in data.items():
            if lang_dict.get(key, None) is None:
                print(f"{key}={value}")
                continue
            result[lang_dict[key]] = value

        with open(f"translations_{code}.json", "w") as out:
            json.dump({"game": result}, out)
