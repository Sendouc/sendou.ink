import React from 'react'
import { useSelector } from 'react-redux'
import { Select } from 'antd'
import language_dict from '../../utils/english_internal.json'

const { Option, OptGroup } = Select;

const mainWeapons = [
  {
    categoryName: "Shooters",
    values: ["Sploosh-o-matic", "Neo Sploosh-o-matic", "Sploosh-o-matic 7",
    "Splattershot Jr.", "Custom Splattershot Jr.", "Kensa Splattershot Jr.",
    "Splash-o-matic", "Neo Splash-o-matic", "Aerospray MG", "Aerospray RG",
    "Aerospray PG", "Splattershot", "Tentatek Splattershot", "Kensa Splattershot",
    ".52 Gal", ".52 Gal Deco", "Kensa .52 Gal", "N-ZAP '85", "N-ZAP '89",
    "N-ZAP '83", "Splattershot Pro", "Forge Splattershot Pro", "Kensa Splattershot Pro",
    ".96 Gal", ".96 Gal Deco", "Jet Squelcher", "Custom Jet Squelcher", "L-3 Nozzlenose", "L-3 Nozzlenose D", "Kensa L-3 Nozzlenose",
    "H-3 Nozzlenose", "H-3 Nozzlenose D", "Cherry H-3 Nozzlenose", "Squeezer",
    "Foil Squeezer"]
  },
  {
    categoryName: "Blasters",
    values: ["Luna Blaster", "Luna Blaster Neo", "Kensa Luna Blaster",
    "Blaster", "Custom Blaster", "Range Blaster", "Custom Range Blaster",
    "Grim Range Blaster", "Rapid Blaster", "Rapid Blaster Deco", "Kensa Rapid Blaster",
    "Rapid Blaster Pro", "Rapid Blaster Pro Deco", "Clash Blaster", "Clash Blaster Neo"]
  },
  {
    categoryName: "Rollers",
    values: ["Carbon Roller", "Carbon Roller Deco", "Splat Roller", "Krak-On Splat Roller",
    "Kensa Splat Roller", "Dynamo Roller", "Gold Dynamo Roller", "Kensa Dynamo Roller",
    "Flingza Roller", "Foil Flingza Roller"]
  },
  {
    categoryName: "Brushes",
    values: ["Inkbrush", "Inkbrush Nouveau",
    "Permanent Inkbrush", "Octobrush", "Octobrush Nouveau", "Kensa Octobrush"]
  },
  {
    categoryName: "Chargers",
    values: ["Classic Squiffer", "New Squiffer", "Fresh Squiffer", "Splat Charger",
    "Firefin Splat Charger", "Kensa Charger", "Splatterscope", "Firefin Splatterscope",
    "Kensa Splatterscope", "E-liter 4K", "Custom E-liter 4K", "E-liter 4K Scope",
    "Custom E-liter 4K Scope", "Bamboozler 14 Mk I", "Bamboozler 14 Mk II",
    "Bamboozler 14 Mk III", "Goo Tuber", "Custom Goo Tuber"]
  },
  {
    categoryName: "Splatlings",
    values: ["Mini Splatling", "Zink Mini Splatling", "Kensa Mini Splatling",
    "Heavy Splatling", "Heavy Splatling Deco", "Heavy Splatling Remix",
    "Hydra Splatling", "Custom Hydra Splatling", "Ballpoint Splatling",
    "Ballpoint Splatling Nouveau", "Nautilus 47", "Nautilus 79"]
  },
  {
    categoryName: "Sloshers",
    values: ["Slosher", "Slosher Deco", "Soda Slosher", "Tri-Slosher",
    "Tri-Slosher Nouveau", "Sloshing Machine", "Sloshing Machine Neo",
    "Kensa Sloshing Machine", "Bloblobber", "Bloblobber Deco", "Explosher",
    "Custom Explosher"]
  },
  {
    categoryName: "Dualies",
    values: ["Dapple Dualies", "Dapple Dualies Nouveau", "Clear Dapple Dualies",
    "Splat Dualies", "Enperry Splat Dualies", "Kensa Splat Dualies", "Glooga Dualies",
    "Glooga Dualies Deco", "Kensa Glooga Dualies", "Dualie Squelchers",
    "Custom Dualie Squelchers", "Dark Tetra Dualies", "Light Tetra Dualies"]
  },
  {
    categoryName: "Brellas",
    values: ["Splat Brella", "Sorella Brella", "Tenta Brella", "Tenta Sorella Brella",
    "Tenta Camo Brella", "Undercover Brella", "Undercover Sorella Brella", "Kensa Undercover Brella"]
  }
]

const allWeapons = [
  {
    categoryName: "Shooters",
    values: ["Sploosh-o-matic", "Neo Sploosh-o-matic", "Sploosh-o-matic 7",
    "Splattershot Jr.", "Custom Splattershot Jr.", "Kensa Splattershot Jr.",
    "Splash-o-matic", "Neo Splash-o-matic", "Aerospray MG", "Aerospray RG",
    "Aerospray PG", "Splattershot", "Tentatek Splattershot", "Kensa Splattershot",
    ".52 Gal", ".52 Gal Deco", "Kensa .52 Gal", "N-ZAP '85", "N-ZAP '89",
    "N-ZAP '83", "Splattershot Pro", "Forge Splattershot Pro", "Kensa Splattershot Pro",
    ".96 Gal", ".96 Gal Deco", "Jet Squelcher", "Custom Jet Squelcher", "L-3 Nozzlenose", "L-3 Nozzlenose D", "Kensa L-3 Nozzlenose",
    "H-3 Nozzlenose", "H-3 Nozzlenose D", "Cherry H-3 Nozzlenose", "Squeezer",
    "Foil Squeezer"]
  },
  {
    categoryName: "Blasters",
    values: ["Luna Blaster", "Luna Blaster Neo", "Kensa Luna Blaster",
    "Blaster", "Custom Blaster", "Range Blaster", "Custom Range Blaster",
    "Grim Range Blaster", "Rapid Blaster", "Rapid Blaster Deco", "Kensa Rapid Blaster",
    "Rapid Blaster Pro", "Rapid Blaster Pro Deco", "Clash Blaster", "Clash Blaster Neo"]
  },
  {
    categoryName: "Rollers",
    values: ["Carbon Roller", "Carbon Roller Deco", "Splat Roller", "Krak-On Splat Roller",
    "Kensa Splat Roller", "Dynamo Roller", "Gold Dynamo Roller", "Kensa Dynamo Roller",
    "Flingza Roller", "Foil Flingza Roller"]
  },
  {
    categoryName: "Brushes",
    values: ["Inkbrush", "Inkbrush Nouveau",
    "Permanent Inkbrush", "Octobrush", "Octobrush Nouveau", "Kensa Octobrush"]
  },
  {
    categoryName: "Chargers",
    values: ["Classic Squiffer", "New Squiffer", "Fresh Squiffer", "Splat Charger",
    "Firefin Splat Charger", "Kensa Charger", "Splatterscope", "Firefin Splatterscope",
    "Kensa Splatterscope", "E-liter 4K", "Custom E-liter 4K", "E-liter 4K Scope",
    "Custom E-liter 4K Scope", "Bamboozler 14 Mk I", "Bamboozler 14 Mk II",
    "Bamboozler 14 Mk III", "Goo Tuber", "Custom Goo Tuber"]
  },
  {
    categoryName: "Splatlings",
    values: ["Mini Splatling", "Zink Mini Splatling", "Kensa Mini Splatling",
    "Heavy Splatling", "Heavy Splatling Deco", "Heavy Splatling Remix",
    "Hydra Splatling", "Custom Hydra Splatling", "Ballpoint Splatling",
    "Ballpoint Splatling Nouveau", "Nautilus 47", "Nautilus 79"]
  },
  {
    categoryName: "Sloshers",
    values: ["Slosher", "Slosher Deco", "Soda Slosher", "Tri-Slosher",
    "Tri-Slosher Nouveau", "Sloshing Machine", "Sloshing Machine Neo",
    "Kensa Sloshing Machine", "Bloblobber", "Bloblobber Deco", "Explosher",
    "Custom Explosher"]
  },
  {
    categoryName: "Dualies",
    values: ["Dapple Dualies", "Dapple Dualies Nouveau", "Clear Dapple Dualies",
    "Splat Dualies", "Enperry Splat Dualies", "Kensa Splat Dualies", "Glooga Dualies",
    "Glooga Dualies Deco", "Kensa Glooga Dualies", "Dualie Squelchers",
    "Custom Dualie Squelchers", "Dark Tetra Dualies", "Light Tetra Dualies"]
  },
  {
    categoryName: "Brellas",
    values: ["Splat Brella", "Sorella Brella", "Tenta Brella", "Tenta Sorella Brella",
    "Tenta Camo Brella", "Undercover Brella", "Undercover Sorella Brella", "Kensa Undercover Brella"]
  },
  {
    categoryName: "Sub weapons",
    values: ["Splat Bomb", "Suction Bomb", "Burst Bomb", "Curling Bomb", "Autobomb", "Ink Mine", "Toxic Mist", "Point Sensor", "Splash Wall", "Sprinkler", "Squid Beakon", "Fizzy Bomb", "Torpedo"]
  },
  {
    categoryName: "Special weapons",
    values: ["Tenta Missiles", "Sting Ray", "Inkjet", "Splashdown", "Ink Armor", "Ink Storm", "Baller", "Bubble Blower", "Booyah Bomb", "Ultra Stamp", "Splat-Bomb Launcher", "Suction-Bomb Launcher", "Curling-Bomb Launcher", "Burst-Bomb Launcher", "Autobomb Launcher"]
  },
]

const SelectElement = ({ value, onChange, content, allowClear=false }) => {
  const localization = useSelector(state => state.localization)
  let contentArr = null
  if (content === "MAINWEAPONS") contentArr = mainWeapons
  else if (content === "ALLWEAPONS") contentArr = allWeapons
  return (
    <>
      <Select style={{ width: 200 }} value={value} onChange={onChange} showSearch placeholder={localization["Select a weapon"]} allowClear={allowClear}>
        {contentArr.map(c => {
          return (
            <OptGroup key={c.categoryName} label={localization[c.categoryName]}>
              {c.values.map(w => {
                return (
                  <Option key={w} value={w}>{localization[w]}</Option>
                )
              })}
            </OptGroup>
          )
        })}
      </Select>
      {' '}{value && <img src={process.env.PUBLIC_URL + `/wpnSmall/Wst_${language_dict[value]}.png`} alt={value} />}
    </>
  )
}

export default SelectElement