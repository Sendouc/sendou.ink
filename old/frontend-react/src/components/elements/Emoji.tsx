import { Image } from "@chakra-ui/react";
import React from "react";
import cb from "../../assets/cb.png";
import rm from "../../assets/rm.png";
import sz from "../../assets/sz.png";
import tc from "../../assets/tc.png";
import tw from "../../assets/tw.png";
import { abilityCodes, gearCodes, weaponCodes } from "../../utils/lists";
import AbilityIcon from "../builds/AbilityIcon";
import GearImage from "../builds/GearImage";
import WeaponImage from "../common/WeaponImage";

const modeCodes: Record<string, string> = {
  turf_war: tw,
  splat_zones: sz,
  tower_control: tc,
  rainmaker: rm,
  clam_blitz: cb,
} as const;

interface EmojiProps {
  value: string;
}

const Emoji: React.FC<EmojiProps> = (props) => {
  const value = props.value.replace(/:/g, "").toLowerCase();

  const weaponName = weaponCodes[value];
  if (!!weaponName)
    return (
      <WeaponImage englishName={weaponName as any} size="SMALL" asInlineBlock />
    );

  const abilityName = abilityCodes[value];
  if (!!abilityName) return <AbilityIcon size="TINY" ability={abilityName} />;

  const gearName = gearCodes[value];
  if (!!gearName) return <GearImage englishName={gearName} mini />;

  const mode = modeCodes[value];
  if (!!mode)
    return <Image src={mode} display="inline-block" w="32px" h="32px" />;

  return <>{props.value}</>;
};

export default Emoji;
