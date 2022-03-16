import clsx from "clsx";
import { AutoBombRush } from "./AutoBombRush";
import { Baller } from "./Baller";
import { BooyahBomb } from "./BooyahBomb";
import { BubbleBlower } from "./BubbleBlower";
import { BurstBombRush } from "./BurstBombRush";
import { ColorDefs } from "./ColorDefs";
import { CurlingBombRush } from "./CurlingBombRush";
import { Deaths } from "./Deaths";
import { InkArmor } from "./InkArmor";
import { Inkjet } from "./Inkjet";
import { InkStorm } from "./InkStorm";
import { Kills } from "./Kills";
import { Splashdown } from "./Splashdown";
import { SplatBombRush } from "./SplatBombRush";
import { Stingray } from "./Stingray";
import { SuctionBombRush } from "./SuctionBombRush";
import { TentaMissiles } from "./TentaMissiles";
import { UltraStamp } from "./UltraStamp";

const iconToId = {
  "Sploosh-o-matic": Splashdown,
  "Neo Sploosh-o-matic": TentaMissiles,
  "Sploosh-o-matic 7": UltraStamp,
  "Splattershot Jr.": InkArmor,
  "Custom Splattershot Jr.": InkStorm,
  "Kensa Splattershot Jr.": BubbleBlower,
  "Splash-o-matic": Inkjet,
  "Neo Splash-o-matic": SuctionBombRush,
  "Aerospray MG": CurlingBombRush,
  "Aerospray RG": Baller,
  "Aerospray PG": BooyahBomb,
  Splattershot: Splashdown,
  "Hero Shot Replica": Splashdown,
  "Tentatek Splattershot": Inkjet,
  "Octo Shot Replica": Inkjet,
  "Kensa Splattershot": TentaMissiles,
  ".52 Gal": Baller,
  ".52 Gal Deco": Stingray,
  "Kensa .52 Gal": BooyahBomb,
  "N-ZAP '85": InkArmor,
  "N-ZAP '89": TentaMissiles,
  "N-ZAP '83": InkStorm,
  "Splattershot Pro": InkStorm,
  "Forge Splattershot Pro": BubbleBlower,
  "Kensa Splattershot Pro": BooyahBomb,
  ".96 Gal": InkArmor,
  ".96 Gal Deco": Splashdown,
  "Jet Squelcher": TentaMissiles,
  "Custom Jet Squelcher": Stingray,
  "Luna Blaster": Baller,
  "Luna Blaster Neo": SuctionBombRush,
  "Kensa Luna Blaster": InkStorm,
  Blaster: Splashdown,
  "Hero Blaster Replica": Splashdown,
  "Custom Blaster": Inkjet,
  "Range Blaster": InkStorm,
  "Custom Range Blaster": BubbleBlower,
  "Grim Range Blaster": TentaMissiles,
  "Clash Blaster": Stingray,
  "Clash Blaster Neo": TentaMissiles,
  "Rapid Blaster": SplatBombRush,
  "Rapid Blaster Deco": Inkjet,
  "Kensa Rapid Blaster": Baller,
  "Rapid Blaster Pro": InkStorm,
  "Rapid Blaster Pro Deco": InkArmor,
  "L-3 Nozzlenose": Baller,
  "L-3 Nozzlenose D": Inkjet,
  "Kensa L-3 Nozzlenose": UltraStamp,
  "H-3 Nozzlenose": TentaMissiles,
  "H-3 Nozzlenose D": InkArmor,
  "Cherry H-3 Nozzlenose": BubbleBlower,
  Squeezer: Stingray,
  "Foil Squeezer": BubbleBlower,
  "Carbon Roller": InkStorm,
  "Carbon Roller Deco": AutoBombRush,
  "Splat Roller": Splashdown,
  "Hero Roller Replica": Splashdown,
  "Krak-On Splat Roller": Baller,
  "Kensa Splat Roller": BubbleBlower,
  "Dynamo Roller": Stingray,
  "Gold Dynamo Roller": InkArmor,
  "Kensa Dynamo Roller": BooyahBomb,
  "Flingza Roller": SplatBombRush,
  "Foil Flingza Roller": TentaMissiles,
  Inkbrush: Splashdown,
  "Inkbrush Nouveau": Baller,
  "Permanent Inkbrush": InkArmor,
  Octobrush: Inkjet,
  "Herobrush Replica": Inkjet,
  "Octobrush Nouveau": TentaMissiles,
  "Kensa Octobrush": UltraStamp,
  "Classic Squiffer": InkArmor,
  "New Squiffer": Baller,
  "Fresh Squiffer": Inkjet,
  "Splat Charger": Stingray,
  "Hero Charger Replica": Stingray,
  "Firefin Splat Charger": SuctionBombRush,
  "Kensa Charger": Baller,
  Splatterscope: Stingray,
  "Firefin Splatterscope": SuctionBombRush,
  "Kensa Splatterscope": Baller,
  "E-liter 4K": InkStorm,
  "Custom E-liter 4K": BubbleBlower,
  "E-liter 4K Scope": InkStorm,
  "Custom E-liter 4K Scope": BubbleBlower,
  "Bamboozler 14 Mk I": TentaMissiles,
  "Bamboozler 14 Mk II": BurstBombRush,
  "Bamboozler 14 Mk III": BubbleBlower,
  "Goo Tuber": Splashdown,
  "Custom Goo Tuber": Inkjet,
  Slosher: TentaMissiles,
  "Hero Slosher Replica": TentaMissiles,
  "Slosher Deco": Baller,
  "Soda Slosher": BurstBombRush,
  "Tri-Slosher": InkArmor,
  "Tri-Slosher Nouveau": InkStorm,
  "Sloshing Machine": Stingray,
  "Sloshing Machine Neo": SplatBombRush,
  "Kensa Sloshing Machine": Splashdown,
  Bloblobber: InkStorm,
  "Bloblobber Deco": SuctionBombRush,
  Explosher: BubbleBlower,
  "Custom Explosher": Baller,
  "Mini Splatling": TentaMissiles,
  "Zink Mini Splatling": InkStorm,
  "Kensa Mini Splatling": UltraStamp,
  "Heavy Splatling": Stingray,
  "Hero Splatling Replica": Stingray,
  "Heavy Splatling Deco": BubbleBlower,
  "Heavy Splatling Remix": BooyahBomb,
  "Hydra Splatling": Splashdown,
  "Custom Hydra Splatling": InkArmor,
  "Ballpoint Splatling": Inkjet,
  "Ballpoint Splatling Nouveau": InkStorm,
  "Nautilus 47": Baller,
  "Nautilus 79": Inkjet,
  "Dapple Dualies": SuctionBombRush,
  "Dapple Dualies Nouveau": InkStorm,
  "Clear Dapple Dualies": Splashdown,
  "Splat Dualies": TentaMissiles,
  "Hero Dualie Replicas": TentaMissiles,
  "Enperry Splat Dualies": Inkjet,
  "Kensa Splat Dualies": Baller,
  "Glooga Dualies": Inkjet,
  "Glooga Dualies Deco": Baller,
  "Kensa Glooga Dualies": InkArmor,
  "Dualie Squelchers": TentaMissiles,
  "Custom Dualie Squelchers": InkStorm,
  "Dark Tetra Dualies": Splashdown,
  "Light Tetra Dualies": AutoBombRush,
  "Splat Brella": InkStorm,
  "Hero Brella Replica": InkStorm,
  "Sorella Brella": SplatBombRush,
  "Tenta Brella": BubbleBlower,
  "Tenta Sorella Brella": CurlingBombRush,
  "Tenta Camo Brella": UltraStamp,
  "Undercover Brella": Splashdown,
  "Undercover Sorella Brella": Baller,
  "Kensa Undercover Brella": InkArmor,
  kills: Kills,
  deaths: Deaths,
} as const;

const SplatnetIcon = ({
  icon,
  count,
  smallCount,
  bravo,
}: {
  icon: keyof typeof iconToId;
  count: number;
  smallCount?: number;
  bravo?: boolean;
}) => {
  const Component = iconToId[icon];
  return (
    <div className={clsx("splatnet-icon-container", { bravo })}>
      <Component />
      <div className="splatnet-icon-text">
        <span className="splatnet-icon-x">x</span>
        <span>{count}</span>
        {smallCount ? (
          <span className="splatnet-icon-smallCount">({smallCount})</span>
        ) : null}
      </div>
      <ColorDefs />
    </div>
  );
};

export default SplatnetIcon;
