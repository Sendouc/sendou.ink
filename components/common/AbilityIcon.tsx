import AD from "assets/abilityIcons/AD.png";
import BDU from "assets/abilityIcons/BDU.png";
import BRU from "assets/abilityIcons/BRU.png";
import CB from "assets/abilityIcons/CB.png";
import DR from "assets/abilityIcons/DR.png";
import EMPTY from "assets/abilityIcons/EMPTY.png";
import H from "assets/abilityIcons/H.png";
import ISM from "assets/abilityIcons/ISM.png";
import ISS from "assets/abilityIcons/ISS.png";
import LDE from "assets/abilityIcons/LDE.png";
import MPU from "assets/abilityIcons/MPU.png";
import NS from "assets/abilityIcons/NS.png";
import OG from "assets/abilityIcons/OG.png";
import OS from "assets/abilityIcons/OS.png";
import QR from "assets/abilityIcons/QR.png";
import QSJ from "assets/abilityIcons/QSJ.png";
import REC from "assets/abilityIcons/REC.png";
import RES from "assets/abilityIcons/RES.png";
import RP from "assets/abilityIcons/RP.png";
import RSU from "assets/abilityIcons/RSU.png";
import SCU from "assets/abilityIcons/SCU.png";
import SJ from "assets/abilityIcons/SJ.png";
import SPU from "assets/abilityIcons/SPU.png";
import SS from "assets/abilityIcons/SS.png";
import SSU from "assets/abilityIcons/SSU.png";
import T from "assets/abilityIcons/T.png";
import TI from "assets/abilityIcons/TI.png";
import UNKNOWN from "assets/abilityIcons/UNKNOWN.png";

const abilityIcons = {
  BDU,
  BRU,
  CB,
  DR,
  H,
  ISM,
  ISS,
  LDE,
  MPU,
  NS,
  OG,
  QR,
  QSJ,
  REC,
  RES,
  RP,
  RSU,
  SCU,
  SJ,
  SPU,
  SS,
  SSU,
  T,
  TI,
  OS,
  AD,
  UNKNOWN,
  "": UNKNOWN,
  EMPTY,
} as const;

//https://github.com/loadout-ink/splat2-calc

const sizeMap = {
  MAIN: "50px",
  SUB: "40px",
  TINY: "30px",
  SUBTINY: "20px",
} as const;

interface AbilityIconProps {
  // FIXME: use enum from generated/graphql.tsx
  ability: string | "EMPTY";
  size: "MAIN" | "SUB" | "TINY" | "SUBTINY";
}

const AbilityIcon: React.FC<AbilityIconProps> = ({ ability, size }) => {
  const key = ability as keyof typeof abilityIcons;
  const abilitySrc = abilityIcons[key];
  return (
    <img
      src={abilitySrc}
      style={{
        zIndex: 2,
        borderRadius: "50%",
        width: sizeMap[size],
        height: sizeMap[size],
        background: "#000",
        border: "2px solid #888",
        borderRight: "0px",
        borderBottom: "0px",
        backgroundSize: "100%",
        boxShadow: "0 0 0 1px #000",
        userSelect: "none",
        display: "inline-block",
      }}
      alt={ability}
    />
  );
};

export default AbilityIcon;
