import React, { useContext } from "react"
import { ReactComponent as ColorDefs } from "../../assets/splatnet/colorDefs.svg"

import { ReactComponent as Kills } from "../../assets/splatnet/kills.svg"
import { ReactComponent as Deaths } from "../../assets/splatnet/deaths.svg"

import { ReactComponent as Baller } from "../../assets/splatnet/baller.svg"
import { ReactComponent as BooyahBomb } from "../../assets/splatnet/booyah-bomb.svg"
import { ReactComponent as BubbleBlower } from "../../assets/splatnet/bubbleblower.svg"
import { ReactComponent as BurstBombRush } from "../../assets/splatnet/burstbomb-rush.svg"
import { ReactComponent as InkArmor } from "../../assets/splatnet/inkarmor.svg"
import { ReactComponent as Inkjet } from "../../assets/splatnet/inkjet.svg"
import { ReactComponent as Inkstorm } from "../../assets/splatnet/inkstorm.svg"
import { ReactComponent as Missiles } from "../../assets/splatnet/missiles.svg"
import { ReactComponent as Stingray } from "../../assets/splatnet/ray.svg"
import { ReactComponent as Splashdown } from "../../assets/splatnet/splashdown.svg"
import { ReactComponent as UltraStamp } from "../../assets/splatnet/stamp.svg"
import { ReactComponent as SuctionRush } from "../../assets/splatnet/suction-rush.svg"
import { ReactComponent as SplatBombRush } from "../../assets/splatnet/splatbomb-rush.svg"
import { ReactComponent as AutoBombRush } from "../../assets/splatnet/autobomb-rush.svg"
import { ReactComponent as CurlingBombRush } from "../../assets/splatnet/curlingbomb-rush.svg"

import "./SplatoonIcon.css"
import MyThemeContext from "../../themeContext"
import { Weapon } from "../../types"

const weaponToSvg = {
  "Sploosh-o-matic": Splashdown,
  "Neo Sploosh-o-matic": Missiles,
  "Sploosh-o-matic 7": UltraStamp,
  "Splattershot Jr.": InkArmor,
  "Custom Splattershot Jr.": Inkstorm,
  "Kensa Splattershot Jr.": BubbleBlower,
  "Splash-o-matic": Inkjet,
  "Neo Splash-o-matic": SuctionRush,
  "Aerospray MG": CurlingBombRush,
  "Aerospray RG": Baller,
  "Aerospray PG": BooyahBomb,
  Splattershot: Splashdown,
  "Hero Shot Replica": Splashdown,
  "Tentatek Splattershot": Inkjet,
  "Octo Shot Replica": Inkjet,
  "Kensa Splattershot": Missiles,
  ".52 Gal": Baller,
  ".52 Gal Deco": Stingray,
  "Kensa .52 Gal": BooyahBomb,
  "N-ZAP '85": InkArmor,
  "N-ZAP '89": Missiles,
  "N-ZAP '83": Inkstorm,
  "Splattershot Pro": Inkstorm,
  "Forge Splattershot Pro": BubbleBlower,
  "Kensa Splattershot Pro": BooyahBomb,
  ".96 Gal": InkArmor,
  ".96 Gal Deco": Splashdown,
  "Jet Squelcher": Missiles,
  "Custom Jet Squelcher": Stingray,
  "Luna Blaster": Baller,
  "Luna Blaster Neo": SuctionRush,
  "Kensa Luna Blaster": Inkstorm,
  Blaster: Splashdown,
  "Hero Blaster Replica": Splashdown,
  "Custom Blaster": Inkjet,
  "Range Blaster": Inkstorm,
  "Custom Range Blaster": BubbleBlower,
  "Grim Range Blaster": Missiles,
  "Clash Blaster": Stingray,
  "Clash Blaster Neo": Missiles,
  "Rapid Blaster": SplatBombRush,
  "Rapid Blaster Deco": Inkjet,
  "Kensa Rapid Blaster": Baller,
  "Rapid Blaster Pro": Inkstorm,
  "Rapid Blaster Pro Deco": InkArmor,
  "L-3 Nozzlenose": Baller,
  "L-3 Nozzlenose D": Inkjet,
  "Kensa L-3 Nozzlenose": UltraStamp,
  "H-3 Nozzlenose": Missiles,
  "H-3 Nozzlenose D": InkArmor,
  "Cherry H-3 Nozzlenose": BubbleBlower,
  Squeezer: Stingray,
  "Foil Squeezer": BubbleBlower,
  "Carbon Roller": Inkstorm,
  "Carbon Roller Deco": AutoBombRush,
  "Splat Roller": Splashdown,
  "Hero Roller Replica": Splashdown,
  "Krak-On Splat Roller": Baller,
  "Kensa Splat Roller": BubbleBlower,
  "Dynamo Roller": Stingray,
  "Gold Dynamo Roller": InkArmor,
  "Kensa Dynamo Roller": BooyahBomb,
  "Flingza Roller": SplatBombRush,
  "Foil Flingza Roller": Missiles,
  Inkbrush: Splashdown,
  "Inkbrush Nouveau": Baller,
  "Permanent Inkbrush": InkArmor,
  Octobrush: Inkjet,
  "Herobrush Replica": Inkjet,
  "Octobrush Nouveau": Missiles,
  "Kensa Octobrush": UltraStamp,
  "Classic Squiffer": InkArmor,
  "New Squiffer": Baller,
  "Fresh Squiffer": Inkjet,
  "Splat Charger": Stingray,
  "Hero Charger Replica": Stingray,
  "Firefin Splat Charger": SuctionRush,
  "Kensa Charger": Baller,
  Splatterscope: Stingray,
  "Firefin Splatterscope": SuctionRush,
  "Kensa Splatterscope": Baller,
  "E-liter 4K": Inkstorm,
  "Custom E-liter 4K": BubbleBlower,
  "E-liter 4K Scope": Inkstorm,
  "Custom E-liter 4K Scope": BubbleBlower,
  "Bamboozler 14 Mk I": Missiles,
  "Bamboozler 14 Mk II": BurstBombRush,
  "Bamboozler 14 Mk III": BubbleBlower,
  "Goo Tuber": Splashdown,
  "Custom Goo Tuber": Inkjet,
  Slosher: Missiles,
  "Hero Slosher Replica": Missiles,
  "Slosher Deco": Baller,
  "Soda Slosher": BurstBombRush,
  "Tri-Slosher": InkArmor,
  "Tri-Slosher Nouveau": Inkstorm,
  "Sloshing Machine": Stingray,
  "Sloshing Machine Neo": SplatBombRush,
  "Kensa Sloshing Machine": Splashdown,
  Bloblobber: Inkstorm,
  "Bloblobber Deco": SuctionRush,
  Explosher: BubbleBlower,
  "Custom Explosher": Baller,
  "Mini Splatling": Missiles,
  "Zink Mini Splatling": Inkstorm,
  "Kensa Mini Splatling": UltraStamp,
  "Heavy Splatling": Stingray,
  "Hero Splatling Replica": Stingray,
  "Heavy Splatling Deco": BubbleBlower,
  "Heavy Splatling Remix": BooyahBomb,
  "Hydra Splatling": Splashdown,
  "Custom Hydra Splatling": InkArmor,
  "Ballpoint Splatling": Inkjet,
  "Ballpoint Splatling Nouveau": Inkstorm,
  "Nautilus 47": Baller,
  "Nautilus 79": Inkjet,
  "Dapple Dualies": SuctionRush,
  "Dapple Dualies Nouveau": Inkstorm,
  "Clear Dapple Dualies": Splashdown,
  "Splat Dualies": Missiles,
  "Hero Dualie Replicas": Missiles,
  "Enperry Splat Dualies": Inkjet,
  "Kensa Splat Dualies": Baller,
  "Glooga Dualies": Inkjet,
  "Glooga Dualies Deco": Baller,
  "Kensa Glooga Dualies": InkArmor,
  "Dualie Squelchers": Missiles,
  "Custom Dualie Squelchers": Inkstorm,
  "Dark Tetra Dualies": Splashdown,
  "Light Tetra Dualies": AutoBombRush,
  "Splat Brella": Inkstorm,
  "Hero Brella Replica": Inkstorm,
  "Sorella Brella": SplatBombRush,
  "Tenta Brella": BubbleBlower,
  "Tenta Sorella Brella": CurlingBombRush,
  "Tenta Camo Brella": UltraStamp,
  "Undercover Brella": Splashdown,
  "Undercover Sorella Brella": Baller,
  "Kensa Undercover Brella": InkArmor,
  kills: Kills,
  deaths: Deaths,
} as const

interface SplatnetIconProps {
  iconFor: "kills" | "deaths" | Weapon
}

const SplatnetIcon: React.FC<SplatnetIconProps> = ({ iconFor }) => {
  const { themeColorHex } = useContext(MyThemeContext)
  const style = {
    width: "35px",
    height: "auto",
    zIndex: 2,
    borderRadius: "50%",
    background: "#000",
    backgroundSize: "125%",
    userSelect: "none",
    "--main-bg-color": themeColorHex,
  } as React.CSSProperties
  const Component = weaponToSvg[iconFor]
  return (
    <>
      <Component style={style} />
      <ColorDefs style={{ width: 0, height: 0 }} />
    </>
  )
}

export default SplatnetIcon
