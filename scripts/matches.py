import os
import gspread
import datetime
from oauth2client.service_account import ServiceAccountCredentials
import pymongo
from config import uri

weapons = [
    "Sploosh-o-matic",
    "Neo Sploosh-o-matic",
    "Sploosh-o-matic 7",
    "Splattershot Jr.",
    "Custom Splattershot Jr.",
    "Kensa Splattershot Jr.",
    "Splash-o-matic",
    "Neo Splash-o-matic",
    "Aerospray MG",
    "Aerospray RG",
    "Aerospray PG",
    "Splattershot",
    "Tentatek Splattershot",
    "Kensa Splattershot",
    ".52 Gal",
    ".52 Gal Deco",
    "Kensa .52 Gal",
    "N-ZAP '85",
    "N-ZAP '89",
    "N-ZAP '83",
    "Splattershot Pro",
    "Forge Splattershot Pro",
    "Kensa Splattershot Pro",
    ".96 Gal",
    ".96 Gal Deco",
    "Jet Squelcher",
    "Custom Jet Squelcher",
    "L-3 Nozzlenose",
    "L-3 Nozzlenose D",
    "Kensa L-3 Nozzlenose",
    "H-3 Nozzlenose",
    "H-3 Nozzlenose D",
    "Cherry H-3 Nozzlenose",
    "Squeezer",
    "Foil Squeezer",
    "Luna Blaster",
    "Luna Blaster Neo",
    "Kensa Luna Blaster",
    "Blaster",
    "Custom Blaster",
    "Range Blaster",
    "Custom Range Blaster",
    "Grim Range Blaster",
    "Rapid Blaster",
    "Rapid Blaster Deco",
    "Kensa Rapid Blaster",
    "Rapid Blaster Pro",
    "Rapid Blaster Pro Deco",
    "Clash Blaster",
    "Clash Blaster Neo",
    "Carbon Roller",
    "Carbon Roller Deco",
    "Splat Roller",
    "Krak-On Splat Roller",
    "Kensa Splat Roller",
    "Dynamo Roller",
    "Gold Dynamo Roller",
    "Kensa Dynamo Roller",
    "Flingza Roller",
    "Foil Flingza Roller",
    "Inkbrush",
    "Inkbrush Nouveau",
    "Permanent Inkbrush",
    "Octobrush",
    "Octobrush Nouveau",
    "Kensa Octobrush",
    "Classic Squiffer",
    "New Squiffer",
    "Fresh Squiffer",
    "Splat Charger",
    "Firefin Splat Charger",
    "Kensa Charger",
    "Splatterscope",
    "Firefin Splatterscope",
    "Kensa Splatterscope",
    "E-liter 4K",
    "Custom E-liter 4K",
    "E-liter 4K Scope",
    "Custom E-liter 4K Scope",
    "Bamboozler 14 Mk I",
    "Bamboozler 14 Mk II",
    "Bamboozler 14 Mk III",
    "Goo Tuber",
    "Custom Goo Tuber",
    "Slosher",
    "Slosher Deco",
    "Soda Slosher",
    "Tri-Slosher",
    "Tri-Slosher Nouveau",
    "Sloshing Machine",
    "Sloshing Machine Neo",
    "Kensa Sloshing Machine",
    "Bloblobber",
    "Bloblobber Deco",
    "Explosher",
    "Custom Explosher",
    "Mini Splatling",
    "Zink Mini Splatling",
    "Kensa Mini Splatling",
    "Heavy Splatling",
    "Heavy Splatling Deco",
    "Heavy Splatling Remix",
    "Hydra Splatling",
    "Custom Hydra Splatling",
    "Ballpoint Splatling",
    "Ballpoint Splatling Nouveau",
    "Nautilus 47",
    "Nautilus 79",
    "Dapple Dualies",
    "Dapple Dualies Nouveau",
    "Clear Dapple Dualies",
    "Splat Dualies",
    "Enperry Splat Dualies",
    "Kensa Splat Dualies",
    "Glooga Dualies",
    "Glooga Dualies Deco",
    "Kensa Glooga Dualies",
    "Dualie Squelchers",
    "Custom Dualie Squelchers",
    "Dark Tetra Dualies",
    "Light Tetra Dualies",
    "Splat Brella",
    "Sorella Brella",
    "Tenta Brella",
    "Tenta Sorella Brella",
    "Tenta Camo Brella",
    "Undercover Brella",
    "Undercover Sorella Brella",
    "Kensa Undercover Brella",
]

weapon_to_replace = {
    "N-ZAP 85": "N-ZAP '85",
    "N-ZAP 89": "N-ZAP '89",
    "N-ZAP 83": "N-ZAP '83",
    "Bamboozler 14 MK I": "Bamboozler 14 Mk I",
    "Bamboozler 14 MK II": "Bamboozler 14 Mk II",
    "Bamboozler 14 MK III": "Bamboozler 14 Mk III",
}

maps = [
    "The Reef",
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
    "Skipper Pavilion",
]

abilities = {
    "": None,
    "Last-Ditch Effort": "LDE",
    "Last Ditch Effort": "LDE",
    "Ink Saver (Sub)": "ISS",
    "Ink Saver Sub": "ISS",
    "Thermal Ink": "TI",
    "Ninja Squid": "NS",
    "Bomb Defense Up DX": "BDU",
    "Stealth Jump": "SJ",
    "Drop Roller": "DR",
    "Ink Recovery Up": "REC",
    "Special Charge Up": "SCU",
    "Special Saver": "SS",
    "Run Speed Up": "RSU",
    "Quick Super Jump": "QSJ",
    "Ink Resistance Up": "RES",
    "Sub Power Up": "BRU",
    "Object Shredder": "OS",
    "Haunt": "H",
    "Opening Gambit": "OG",
    "Respawn Punisher": "RP",
    "Special Power Up": "SPU",
    "Comeback": "CB",
    "Main Power Up": "MPU",
    "Ink Saver (Main)": "ISM",
    "Ink Saver Main": "ISM",
    "Tenacity": "T",
    "Quick Respawn": "QR",
    "Swim Speed Up": "SSU",
}

scope = [
    "https://spreadsheets.google.com/feeds",
    "https://www.googleapis.com/auth/drive",
]
script_dir = os.path.dirname(__file__)
rel_path = "google_sheet_secret.json"
abs_file_path = os.path.join(script_dir, rel_path)
sheets = gspread.authorize(
    ServiceAccountCredentials.from_json_keyfile_name(abs_file_path, scope)
)
url = "https://docs.google.com/spreadsheets/d/1_-E1G6CJzrrvQOMBRLr2BgOR5pQNHWTqnHlokWIgkW4"
sheet = sheets.open_by_url(url)

client = pymongo.MongoClient(uri)
db = client.production

tournament = {
    "name": sheet.title.split("]")[2].split("[")[0].strip(),
    "jpn": "[JP]" in sheet.title,
    "google_sheet_url": url,
    "date": datetime.datetime.strptime(sheet.title.split("]")[0][1:], "%Y-%m-%d"),
}
tournament_id = db.tournaments.insert_one(tournament).inserted_id
worksheet = sheet.worksheet("Summary")
rows = worksheet.get_all_values()
del rows[:2]
weapon_count = {}
round_count = {}

# Necessary because there are columns where one cell takes over multiple cells
# which is represented as emptry strings when gspread parses
current_round = None
current_game = None
current_mode = None
current_map = None
current_winning_team = None
current_losing_team = None

winner_team = None

game_to_enter = {
    "tournament_id": tournament_id,
    "stage": None,
    "mode": None,
    "game_number": None,
    "winning_team_name": None,
    "winning_team_players": [],
    "winning_team_weapons": [],
    "winning_team_main_abilities": [],
    "losing_team_name": None,
    "losing_team_players": [],
    "losing_team_weapons": [],
    "losing_team_main_abilities": [],
}
games_to_insertmany = []
for count, row in enumerate(rows):
    round_name = row[0]
    if "-" in round_name:
        round_name = round_name.replace(" ", "")
    if round_name == "":
        round_name = current_round
    else:
        current_round = round_name
        round_count[round_name] = round_count.get(round_name, 0) + 1
    assert round_name in ["Quarter-Finals", "Semi-Finals", "Finals", "R1"]
    game = row[1]
    if "Game" in game:
        game = int(game.split(" ")[1])
    mode = row[2]
    if mode == "":
        mode = current_mode
    else:
        current_mode = mode
    assert mode in ["SZ", "TC", "RM", "CB", "TW"]
    stage = row[4]
    if stage == "":
        stage = current_map
    else:
        current_map = stage
    assert stage in maps
    winning_team_name = row[6]
    if game != "" and winning_team_name == "":
        winning_team_name = input(f"Winning team name for row {count+1}=?")
    if winning_team_name == "":
        winning_team_name = current_winning_team
    else:
        current_winning_team = winning_team_name
    winning_team_player = row[7]
    assert winning_team_player != ""
    winning_team_player_weapon = row[8]
    if winning_team_player_weapon in weapon_to_replace:
        winning_team_player_weapon = weapon_to_replace[winning_team_player_weapon]
    assert (
        winning_team_player_weapon in weapons
    ), f"'{winning_team_player_weapon}' not a valid weapon."
    weapon_count[winning_team_player_weapon] = (
        weapon_count.get(winning_team_player_weapon, 0) + 1
    )
    winning_team_player_main_abilities = [
        abilities[row[12]],
        abilities[row[13]],
        abilities[row[14]],
    ]
    losing_team_name = row[18]
    if game != "" and losing_team_name == "":
        losing_team_name = input(f"Losing team name for row {count+1}=?")
    if losing_team_name == "":
        losing_team_name = current_losing_team
    else:
        current_losing_team = losing_team_name
    losing_team_player = row[19]
    assert losing_team_player != ""
    losing_team_player_weapon = row[20]
    if losing_team_player_weapon in weapon_to_replace:
        losing_team_player_weapon = weapon_to_replace[losing_team_player_weapon]
    assert (
        losing_team_player_weapon in weapons
    ), f"'{losing_team_player_weapon}' not a valid weapon."
    weapon_count[losing_team_player_weapon] = (
        weapon_count.get(losing_team_player_weapon, 0) + 1
    )
    losing_team_player_main_abitilies = [None, None, None]
    if len(row) > 26:
        losing_team_player_main_abitilies = [
            abilities[row[24]],
            abilities[row[25]],
            abilities[row[26]],
        ]

    # This is here so we can accurately check when there should be a new team
    if game == "":
        game = current_game
    else:
        current_game = game
    assert game > 0 and game < 10

    round_bracket = (
        f" ({round_count[round_name]})"
        if round_name in round_count and round_count[round_name] > 1
        else ""
    )
    round_name = f"{round_name}{round_bracket}"

    if (
        game_to_enter["game_number"] is not None
        and game != game_to_enter["game_number"]
    ):  # We have entered a new game so we insert the previous document
        games_to_insertmany.append(
            game_to_enter.copy()
        )  # https://stackoverflow.com/questions/17529216/mongodb-insert-raises-duplicate-key-error
        game_to_enter["winning_team_players"] = []
        game_to_enter["winning_team_weapons"] = []
        game_to_enter["winning_team_main_abilities"] = []
        game_to_enter["losing_team_players"] = []
        game_to_enter["losing_team_weapons"] = []
        game_to_enter["losing_team_main_abilities"] = []

    game_to_enter["stage"] = stage
    game_to_enter["mode"] = mode
    game_to_enter["game_number"] = game
    game_to_enter["winning_team_name"] = winning_team_name
    game_to_enter["winning_team_players"].append(winning_team_player)
    game_to_enter["winning_team_weapons"].append(winning_team_player_weapon)
    game_to_enter["winning_team_main_abilities"].append(
        winning_team_player_main_abilities
    )
    game_to_enter["losing_team_name"] = losing_team_name
    game_to_enter["losing_team_players"].append(losing_team_player)
    game_to_enter["losing_team_weapons"].append(losing_team_player_weapon)
    game_to_enter["losing_team_main_abilities"].append(
        losing_team_player_main_abitilies
    )

games_to_insertmany.append(game_to_enter)
db.rounds.insert_many(games_to_insertmany)

# TODO: Update tournaments w/ most_popular_weapons & add winner_team_name & winner_team_players & winner_team_unique_ids
# TODO: Maybe also already add unique_ids to round documents?
