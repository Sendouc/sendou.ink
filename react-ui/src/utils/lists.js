export function getNumberWithOrdinal(n) {
  var s=["th","st","nd","rd"],
  v=n%100;
  return n+(s[(v-20)%10]||s[v]||s[0]);
}

export function choose(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

export const modes = ["", "Splat Zones", "Tower Control", "Rainmaker", "Clam Blitz"]

export const months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export const weapons = ["Sploosh-o-matic", "Neo Sploosh-o-matic", "Sploosh-o-matic 7",
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

export const memCakes = ['moon.png', 'S2_Gear_Headgear_Fresh_Fish_Head.png', 'S2_Gear_Headgear_Anglerfish_Mask.png', 'nstc.png', 'chimera.png', 'olive.png', 'pulla.png', 'qr.png', 'OctCollectIcon_00.png', 'OctCollectIcon_01.png', 'OctCollectIcon_02.png', 'OctCollectIcon_03.png', 'OctCollectIcon_04.png', 'OctCollectIcon_05.png', 'OctCollectIcon_06.png', 'OctCollectIcon_07.png', 'OctCollectIcon_08.png', 'OctCollectIcon_09.png', 'OctCollectIcon_10.png', 'OctCollectIcon_11.png', 'OctCollectIcon_12.png', 'OctCollectIcon_13.png', 'OctCollectIcon_14.png', 'OctCollectIcon_15.png', 'OctCollectIcon_16.png', 'OctCollectIcon_17.png', 'OctCollectIcon_18.png', 'OctCollectIcon_19.png', 'OctCollectIcon_20.png', 'OctCollectIcon_21.png', 'OctCollectIcon_22.png', 'OctCollectIcon_23.png', 'OctCollectIcon_24.png', 'OctCollectIcon_25.png', 'OctCollectIcon_26.png', 'OctCollectIcon_27.png', 'OctCollectIcon_28.png', 'OctCollectIcon_29.png', 'OctCollectIcon_30.png', 'OctCollectIcon_31.png', 'OctCollectIcon_32.png', 'OctCollectIcon_33.png', 'OctCollectIcon_34.png', 'OctCollectIcon_35.png', 'OctCollectIcon_36.png', 'OctCollectIcon_37.png', 'OctCollectIcon_38.png', 'OctCollectIcon_39.png', 'OctCollectIcon_40.png', 'OctCollectIcon_41.png', 'OctCollectIcon_42.png', 'OctCollectIcon_43.png', 'OctCollectIcon_44.png', 'OctCollectIcon_45.png', 'OctCollectIcon_46.png', 'OctCollectIcon_47.png', 'OctCollectIcon_48.png', 'OctCollectIcon_49.png', 'OctCollectIcon_50.png', 'OctCollectIcon_51.png', 'OctCollectIcon_52.png', 'OctCollectIcon_53.png', 'OctCollectIcon_54.png', 'OctCollectIcon_55.png', 'OctCollectIcon_56.png', 'OctCollectIcon_57.png', 'OctCollectIcon_59.png', 'OctCollectIcon_60.png', 'OctCollectIcon_61.png', 'OctCollectIcon_62.png', 'OctCollectIcon_63.png', 'OctCollectIcon_64.png', 'OctCollectIcon_65.png', 'OctCollectIcon_66.png', 'OctCollectIcon_67.png', 'OctCollectIcon_68.png', 'OctCollectIcon_69.png', 'OctCollectIcon_70.png', 'OctCollectIcon_71.png', 'OctCollectIcon_72.png', 'OctCollectIcon_73.png', 'OctCollectIcon_74.png', 'OctCollectIcon_75.png', 'OctCollectIcon_76.png', 'OctCollectIcon_77.png', 'OctCollectIcon_78.png', 'OctCollectIcon_79.png', 'lanista.png', 'heart.png']

export const shooters = ["Sploosh-o-matic", "Neo Sploosh-o-matic", "Sploosh-o-matic 7",
"Splattershot Jr.", "Custom Splattershot Jr.", "Kensa Splattershot Jr.",
"Splash-o-matic", "Neo Splash-o-matic", "Aerospray MG", "Aerospray RG",
"Aerospray PG", "Splattershot", "Tentatek Splattershot", "Kensa Splattershot",
".52 Gal", ".52 Gal Deco", "Kensa .52 Gal", "N-ZAP '85", "N-ZAP '89",
"N-ZAP '83", "Splattershot Pro", "Forge Splattershot Pro", "Kensa Splattershot Pro",
".96 Gal", ".96 Gal Deco", "Jet Squelcher", "Custom Jet Squelcher"]

export const semiauto = ["L-3 Nozzlenose", "L-3 Nozzlenose D", "Kensa L-3 Nozzlenose",
"H-3 Nozzlenose", "H-3 Nozzlenose D", "Cherry H-3 Nozzlenose", "Squeezer",
"Foil Squeezer"]

export const blasters = ["Luna Blaster", "Luna Blaster Neo", "Kensa Luna Blaster",
"Blaster", "Custom Blaster", "Range Blaster", "Custom Range Blaster",
"Grim Range Blaster", "Rapid Blaster", "Rapid Blaster Deco", "Kensa Rapid Blaster",
"Rapid Blaster Pro", "Rapid Blaster Pro Deco", "Clash Blaster", "Clash Blaster Neo"]

export const rollers = ["Carbon Roller", "Carbon Roller Deco", "Splat Roller", "Krak-On Splat Roller",
"Kensa Splat Roller", "Dynamo Roller", "Gold Dynamo Roller", "Kensa Dynamo Roller",
"Flingza Roller", "Foil Flingza Roller"]

export const brushes = ["Inkbrush", "Inkbrush Nouveau",
"Permanent Inkbrush", "Octobrush", "Octobrush Nouveau", "Kensa Octobrush"]

export const chargers = ["Classic Squiffer", "New Squiffer", "Fresh Squiffer", "Splat Charger",
"Firefin Splat Charger", "Kensa Charger", "Splatterscope", "Firefin Splatterscope",
"Kensa Splatterscope", "E-liter 4K", "Custom E-liter 4K", "E-liter 4K Scope",
"Custom E-liter 4K Scope", "Bamboozler 14 Mk I", "Bamboozler 14 Mk II",
"Bamboozler 14 Mk III", "Goo Tuber", "Custom Goo Tuber"]

export const sloshers = ["Slosher", "Slosher Deco", "Soda Slosher", "Tri-Slosher",
"Tri-Slosher Nouveau", "Sloshing Machine", "Sloshing Machine Neo",
"Kensa Sloshing Machine", "Bloblobber", "Bloblobber Deco", "Explosher",
"Custom Explosher"]

export const splatlings = ["Mini Splatling", "Zink Mini Splatling", "Kensa Mini Splatling",
"Heavy Splatling", "Heavy Splatling Deco", "Heavy Splatling Remix",
"Hydra Splatling", "Custom Hydra Splatling", "Ballpoint Splatling",
"Ballpoint Splatling Nouveau", "Nautilus 47", "Nautilus 79"]

export const dualies = ["Dapple Dualies", "Dapple Dualies Nouveau", "Clear Dapple Dualies",
"Splat Dualies", "Enperry Splat Dualies", "Kensa Splat Dualies", "Glooga Dualies",
"Glooga Dualies Deco", "Kensa Glooga Dualies", "Dualie Squelchers",
"Custom Dualie Squelchers", "Dark Tetra Dualies", "Light Tetra Dualies"]

export const brellas = ["Splat Brella", "Sorella Brella", "Tenta Brella", "Tenta Sorella Brella",
"Tenta Camo Brella", "Undercover Brella", "Undercover Sorella Brella", "Kensa Undercover Brella"]

export const weaponsByCategory = {"Shooters": shooters, "Semi-automatic Shooters": semiauto,
"Blasters": blasters, "Rollers": rollers, "Brushes": brushes, "Chargers": chargers, "Sloshers": sloshers,
"Splatlings": splatlings, "Dualies": dualies, "Brellas": brellas}

export const categoryKeys = ["Shooters", "Semi-automatic Shooters", "Blasters", "Rollers", "Brushes", "Chargers", "Sloshers", "Splatlings", "Dualies", "Brellas"]

export const clothingGear = ["Clt_AMB000", "Clt_AMB001", "Clt_AMB002", "Clt_AMB003", "Clt_AMB004", "Clt_AMB005", "Clt_AMB006", "Clt_AMB007", "Clt_AMB008", "Clt_AMB009", "Clt_AMB010", "Clt_COP100", "Clt_COP101", "Clt_COP102", "Clt_COP103", "Clt_COP104", "Clt_COP105", "Clt_COP106", "Clt_COP107", "Clt_COP108", "Clt_COP109", "Clt_COP110", "Clt_CRC000", "Clt_FST001", "Clt_FST002", "Clt_HAP001", "Clt_JKT000", "Clt_JKT001", "Clt_JKT002", "Clt_JKT003", "Clt_JKT004", "Clt_JKT005", "Clt_JKT006", "Clt_JKT007", "Clt_JKT008", "Clt_JKT009", "Clt_JKT010", "Clt_JKT011", "Clt_JKT012", "Clt_JKT013", "Clt_JKT014", "Clt_JKT015", "Clt_JKT016", "Clt_JKT017", "Clt_JKT018", "Clt_JKT019", "Clt_JKT020", "Clt_JKT021", "Clt_JKT022", "Clt_JKT023", "Clt_JKT024", "Clt_JKT025", "Clt_JKT026", "Clt_JKT027", "Clt_JKT028", "Clt_JKT029", "Clt_JKT030", "Clt_JKT031", "Clt_JKT032", "Clt_JKT033", "Clt_JKT034", "Clt_JKT035", "Clt_JKT036", "Clt_JKT037", "Clt_JKT038", "Clt_JKT039", "Clt_JKT040", "Clt_JKT041", "Clt_JKT042", "Clt_JKT043", "Clt_JKT044", "Clt_MSN000", "Clt_MSN004", "Clt_MSN101", "Clt_MSN104", "Clt_MSN105", "Clt_MSN106", "Clt_PLO000", "Clt_PLO001", "Clt_PLO002", "Clt_PLO003", "Clt_PLO004", "Clt_PLO005", "Clt_PLO006", "Clt_PLO007", "Clt_PLO008", "Clt_PRK000", "Clt_PRK001", "Clt_PRK002", "Clt_PRK004", "Clt_PRK005", "Clt_PRK006", "Clt_PRK007", "Clt_PRK008", "Clt_PRK009", "Clt_PRK010", "Clt_PRK011", "Clt_RVL000", "Clt_RVL001", "Clt_SHT000", "Clt_SHT001", "Clt_SHT002", "Clt_SHT003", "Clt_SHT004", "Clt_SHT005", "Clt_SHT006", "Clt_SHT007", "Clt_SHT008", "Clt_SHT009", "Clt_SHT010", "Clt_SHT011", "Clt_SHT012", "Clt_SHT013", "Clt_SHT014", "Clt_SHT015", "Clt_SHT017", "Clt_SHT018", "Clt_SHT019", "Clt_SHT020", "Clt_SHT021", "Clt_SHT022", "Clt_SHT023", "Clt_SHT024", "Clt_SHT025", "Clt_SHT026", "Clt_SHT027", "Clt_SHT028", "Clt_SHT029", "Clt_SWT000", "Clt_SWT001", "Clt_SWT002", "Clt_SWT003", "Clt_SWT004", "Clt_SWT005", "Clt_SWT006", "Clt_SWT007", "Clt_SWT008", "Clt_SWT009", "Clt_SWT010", "Clt_SWT011", "Clt_SWT012", "Clt_SWT013", "Clt_SWT014", "Clt_SWT015", "Clt_TEL000", "Clt_TEL001", "Clt_TEL002", "Clt_TEL003", "Clt_TEL004", "Clt_TEL005", "Clt_TEL006", "Clt_TEL007", "Clt_TEL008", "Clt_TEL009", "Clt_TEL010", "Clt_TEL011", "Clt_TEL012", "Clt_TEL013", "Clt_TEL014", "Clt_TEL015", "Clt_TEL016", "Clt_TEL017", "Clt_TEL018", "Clt_TEL019", "Clt_TEL020", "Clt_TEL021", "Clt_TEL022", "Clt_TEL023", "Clt_TEL024", "Clt_TES000", "Clt_TES001", "Clt_TES002", "Clt_TES003", "Clt_TES004", "Clt_TES005", "Clt_TES006", "Clt_TES007", "Clt_TES008", "Clt_TES009", "Clt_TES010", "Clt_TES011", "Clt_TES012", "Clt_TES013", "Clt_TES014", "Clt_TES015", "Clt_TES016", "Clt_TES017", "Clt_TES018", "Clt_TES019", "Clt_TES020", "Clt_TES021", "Clt_TES022", "Clt_TES023", "Clt_TES026", "Clt_TES027", "Clt_TES028", "Clt_TES029", "Clt_TES030", "Clt_TES031", "Clt_TES032", "Clt_TES033", "Clt_TES034", "Clt_TES035", "Clt_TES036", "Clt_TES037", "Clt_TES038", "Clt_TES039", "Clt_TES040", "Clt_TES041", "Clt_TES042", "Clt_TES043", "Clt_TES044", "Clt_TES045", "Clt_TES046", "Clt_TES047", "Clt_TES048", "Clt_TES049", "Clt_TES050", "Clt_TES051", "Clt_TES052", "Clt_TES053", "Clt_TES054", "Clt_TES055", "Clt_TES056", "Clt_TES057", "Clt_TES058", "Clt_TES059", "Clt_TES060", "Clt_TES061", "Clt_TLY000", "Clt_TLY001", "Clt_TLY002", "Clt_TLY003", "Clt_TLY004", "Clt_TLY005", "Clt_TLY006", "Clt_TLY007", "Clt_TLY008", "Clt_TLY009", "Clt_TLY010", "Clt_TLY011", "Clt_TLY012", "Clt_TLY013", "Clt_TNK000", "Clt_TNK001", "Clt_TNK003", "Clt_TNK004", "Clt_TNK005", "Clt_TNK006", "Clt_VST000", "Clt_VST001", "Clt_VST002", "Clt_VST003", "Clt_VST004", "Clt_VST005", "Clt_VST006", "Clt_VST007", "Clt_VST008", "Clt_VST009"]

export const headGear = ["Hed_ACC001", "Hed_AMB000", "Hed_AMB001", "Hed_AMB002", "Hed_AMB003", "Hed_AMB004", "Hed_AMB005", "Hed_AMB006", "Hed_AMB007", "Hed_AMB008", "Hed_AMB009", "Hed_AMB010", "Hed_CAP000", "Hed_CAP001", "Hed_CAP002", "Hed_CAP003", "Hed_CAP004", "Hed_CAP005", "Hed_CAP006", "Hed_CAP007", "Hed_CAP008", "Hed_CAP009", "Hed_CAP010", "Hed_CAP011", "Hed_CAP012", "Hed_CAP014", "Hed_CAP015", "Hed_CAP018", "Hed_CAP019", "Hed_CAP020", "Hed_CAP021", "Hed_CAP023", "Hed_CAP024", "Hed_CAP025", "Hed_CAP026", "Hed_CAP027", "Hed_COP100", "Hed_COP101", "Hed_COP102", "Hed_COP103", "Hed_COP104", "Hed_COP105", "Hed_COP106", "Hed_COP107", "Hed_COP108", "Hed_COP109", "Hed_CRC000", "Hed_EYE000", "Hed_EYE001", "Hed_EYE002", "Hed_EYE003", "Hed_EYE004", "Hed_EYE005", "Hed_EYE006", "Hed_EYE007", "Hed_EYE008", "Hed_EYE009", "Hed_EYE010", "Hed_EYE011", "Hed_EYE012", "Hed_EYE013", "Hed_EYE014", "Hed_EYE015", "Hed_EYE016", "Hed_EYE017", "Hed_EYE018", "Hed_EYE019", "Hed_EYE020", "Hed_FST000", "Hed_HAP000", "Hed_HAP001", "Hed_HAP002", "Hed_HAP003", "Hed_HAP004", "Hed_HAP005", "Hed_HAP006", "Hed_HAP007", "Hed_HAP008", "Hed_HAP009", "Hed_HAP010", "Hed_HAP011", "Hed_HAP012", "Hed_HAP013", "Hed_HAP014", "Hed_HAP015", "Hed_HAT000", "Hed_HAT001", "Hed_HAT002", "Hed_HAT003", "Hed_HAT004", "Hed_HAT005", "Hed_HAT006", "Hed_HAT007", "Hed_HAT008", "Hed_HAT009", "Hed_HAT010", "Hed_HAT011", "Hed_HAT012", "Hed_HAT013", "Hed_HAT014", "Hed_HBD001", "Hed_HBD002", "Hed_HBD003", "Hed_HBD004", "Hed_HBD005", "Hed_HBD007", "Hed_HBD008", "Hed_HDP000", "Hed_HDP001", "Hed_HDP002", "Hed_HDP003", "Hed_HDP004", "Hed_HDP005", "Hed_HDP006", "Hed_MET000", "Hed_MET002", "Hed_MET004", "Hed_MET005", "Hed_MET006", "Hed_MET007", "Hed_MET008", "Hed_MET009", "Hed_MET010", "Hed_MET011", "Hed_MSK000", "Hed_MSK001", "Hed_MSK002", "Hed_MSK003", "Hed_MSK004", "Hed_MSK005", "Hed_MSK006", "Hed_MSK007", "Hed_MSK008", "Hed_MSK009", "Hed_MSK010", "Hed_MSK011", "Hed_MSK012", "Hed_MSK013", "Hed_MSN000", "Hed_MSN004", "Hed_MSN101", "Hed_MSN104", "Hed_MSN105", "Hed_MSN106", "Hed_MSN107", "Hed_MSN108", "Hed_NCP000", "Hed_NCP001", "Hed_NCP002", "Hed_NCP003", "Hed_NCP004", "Hed_NCP005", "Hed_NCP006", "Hed_NCP007", "Hed_NCP008", "Hed_NCP009", "Hed_NCP010", "Hed_NCP011", "Hed_RVL002", "Hed_RVL003", "Hed_VIS000", "Hed_VIS001", "Hed_VIS002", "Hed_VIS003", "Hed_VIS004"]

export const shoesGear = ["Shs_AMB000", "Shs_AMB001", "Shs_AMB002", "Shs_AMB003", "Shs_AMB004", "Shs_AMB005", "Shs_AMB006", "Shs_AMB007", "Shs_AMB008", "Shs_AMB009", "Shs_AMB010", "Shs_BOT000", "Shs_BOT001", "Shs_BOT002", "Shs_BOT003", "Shs_BOT004", "Shs_BOT005", "Shs_BOT006", "Shs_BOT007", "Shs_BOT008", "Shs_BOT009", "Shs_BOT010", "Shs_BOT011", "Shs_BOT012", "Shs_BOT013", "Shs_BOT014", "Shs_BOT015", "Shs_BOT016", "Shs_BOT017", "Shs_BOT018", "Shs_CFS000", "Shs_CFS001", "Shs_COP101", "Shs_COP102", "Shs_COP103", "Shs_COP104", "Shs_COP105", "Shs_COP106", "Shs_CRC000", "Shs_FST000", "Shs_HAP000", "Shs_HAP001", "Shs_HAP002", "Shs_HAP003", "Shs_HAP004", "Shs_HAP005", "Shs_HAP006", "Shs_HAP007", "Shs_LTS000", "Shs_LTS001", "Shs_LTS002", "Shs_LTS003", "Shs_LTS004", "Shs_LTS005", "Shs_LTS006", "Shs_LTS007", "Shs_LTS008", "Shs_LTS009", "Shs_LTS010", "Shs_LTS011", "Shs_LTS012", "Shs_MSN000", "Shs_MSN004", "Shs_MSN101", "Shs_MSN104", "Shs_MSN105", "Shs_MSN106", "Shs_RVL000", "Shs_SDL000", "Shs_SDL001", "Shs_SDL003", "Shs_SDL004", "Shs_SDL005", "Shs_SDL006", "Shs_SDL007", "Shs_SDL008", "Shs_SDL009", "Shs_SHI000", "Shs_SHI001", "Shs_SHI002", "Shs_SHI003", "Shs_SHI004", "Shs_SHI005", "Shs_SHI006", "Shs_SHI008", "Shs_SHI009", "Shs_SHI010", "Shs_SHI011", "Shs_SHI012", "Shs_SHI013", "Shs_SHI014", "Shs_SHI015", "Shs_SHI016", "Shs_SHI017", "Shs_SHI018", "Shs_SHI019", "Shs_SHI020", "Shs_SHI021", "Shs_SHI022", "Shs_SHI023", "Shs_SHI024", "Shs_SHI025", "Shs_SHI026", "Shs_SHI027", "Shs_SHI028", "Shs_SHI029", "Shs_SHI030", "Shs_SHI031", "Shs_SHI032", "Shs_SHI033", "Shs_SHI034", "Shs_SHI035", "Shs_SHI036", "Shs_SHI037", "Shs_SHI038", "Shs_SHI039", "Shs_SHI040", "Shs_SHI041", "Shs_SHT000", "Shs_SHT001", "Shs_SHT002", "Shs_SHT003", "Shs_SHT004", "Shs_SHT005", "Shs_SHT006", "Shs_SHT007", "Shs_SHT008", "Shs_SHT009", "Shs_SHT010", "Shs_SHT011", "Shs_SHT012", "Shs_SHT013", "Shs_SHT014", "Shs_SHT015", "Shs_SHT016", "Shs_SHT017", "Shs_SHT018", "Shs_SHT019", "Shs_SLO000", "Shs_SLO001", "Shs_SLO002", "Shs_SLO003", "Shs_SLO004", "Shs_SLO005", "Shs_SLO006", "Shs_SLO007", "Shs_SLO008", "Shs_SLO009", "Shs_SLO010", "Shs_SLO011", "Shs_SLO012", "Shs_SLO013", "Shs_SLO014", "Shs_SLO015", "Shs_SLO016", "Shs_SLO017", "Shs_SLO018", "Shs_SLO019", "Shs_SLO020", "Shs_SLP000", "Shs_SLP001", "Shs_SLP002", "Shs_SLP003", "Shs_TRS000", "Shs_TRS001", "Shs_TRS002"]