import json
from pprint import pprint

head = {}
clothes = {}
shoes = {}

with open("lang_dict_EUen.json") as f:
    lang_dict = json.load(f)

with open("GearInfo_Head.json") as f:
    data = json.load(f)
    for obj in data:
        if obj["ModelName"] in lang_dict:
            brand = lang_dict[obj["Brand"]]
            lista = head.get(brand, [])
            lista.append(lang_dict[obj["ModelName"]])
            head[brand] = lista

with open("GearInfo_Shoes.json") as f:
    data = json.load(f)
    for obj in data:
        if obj["ModelName"] in lang_dict:
            brand = lang_dict[obj["Brand"]]
            lista = shoes.get(brand, [])
            lista.append(lang_dict[obj["ModelName"]])
            shoes[brand] = lista

with open("GearInfo_Clothes.json") as f:
    data = json.load(f)
    for obj in data:
        if obj["ModelName"] in lang_dict:
            brand = lang_dict[obj["Brand"]]
            lista = clothes.get(brand, [])
            lista.append(lang_dict[obj["ModelName"]])
            clothes[brand] = lista

to_file = []
brands = sorted(
    list(set(list(head.keys()) + list(clothes.keys()) + list(shoes.keys()))),
    key=str.casefold,
)

for b in brands:
    to_file.append(
        {
            "brand": b,
            "head": sorted(head.get(b, []), key=str.casefold),
            "clothes": sorted(clothes.get(b, []), key=str.casefold),
            "shoes": sorted(shoes.get(b, []), key=str.casefold),
        }
    )

pprint(to_file)
