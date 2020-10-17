import { Image } from "@chakra-ui/core";
import cb from "assets/cb.png";
import rm from "assets/rm.png";
import sz from "assets/sz.png";
import tc from "assets/tc.png";
import tw from "assets/tw.png";
import AbilityIcon from "components/AbilityIcon";
import GearImage from "components/GearImage";
import WeaponImage from "components/WeaponImage";
import { abilityMarkdownCodes } from "lib/lists/abilityMarkdownCodes";
import { gearMarkdownCodes } from "lib/lists/gearMarkdownCodes";
import { weaponMarkdownCodes } from "lib/lists/weaponMarkdownCodes";

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

  const keyWeapon = value as keyof typeof weaponMarkdownCodes;
  const weaponName = weaponMarkdownCodes[keyWeapon];
  if (!!weaponName)
    return <WeaponImage englishName={weaponName} size="SMALL" asInlineBlock />;

  const keyAbility = value as keyof typeof abilityMarkdownCodes;
  const abilityName = abilityMarkdownCodes[keyAbility];
  if (!!abilityName) return <AbilityIcon size="TINY" ability={abilityName} />;

  const keyGear = value as keyof typeof gearMarkdownCodes;
  const gearName = gearMarkdownCodes[keyGear];
  if (!!gearName) return <GearImage englishName={gearName} mini />;

  const mode = modeCodes[value];
  if (!!mode)
    return <Image src={mode} display="inline-block" w="32px" h="32px" />;

  return <>{props.value}</>;
};

export default Emoji;
