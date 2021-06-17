import AbilityIcon from "components/common/AbilityIcon";
import GearImage from "components/common/GearImage";
import WeaponImage from "components/common/WeaponImage";
import Image from "next/image";
import { abilityMarkdownCodes } from "utils/lists/abilityMarkdownCodes";
import { gearMarkdownCodes } from "utils/lists/gearMarkdownCodes";
import { codeToWeapon } from "utils/lists/weaponCodes";
import { subSpecialWeaponMarkdownCodes } from "../../utils/lists/subSpecialWeaponMarkdownCodes";

const modeCodes: Record<string, string> = {
  turf_war: "TW",
  splat_zones: "SZ",
  tower_control: "TC",
  rainmaker: "RM",
  clam_blitz: "CB",
} as const;

interface EmojiProps {
  value: string;
}

const Emoji: React.FC<EmojiProps> = (props) => {
  const value = props.value.replace(/:/g, "").toLowerCase();

  //TODO: inline removed : make sure emojis blend in with the text

  const keyWeapon = value as keyof typeof codeToWeapon;
  const weaponName = codeToWeapon[keyWeapon];
  if (!!weaponName) return <WeaponImage name={weaponName} size={32} />;

  const keyAbility = value as keyof typeof abilityMarkdownCodes;
  const abilityName = abilityMarkdownCodes[keyAbility];
  if (!!abilityName) return <AbilityIcon size="TINY" ability={abilityName} />;

  const keyGear = value as keyof typeof gearMarkdownCodes;
  const gearName = gearMarkdownCodes[keyGear];
  if (!!gearName) return <GearImage englishName={gearName} mini />;

  const keySubSpecial = value as keyof typeof subSpecialWeaponMarkdownCodes;
  const subSpecialWeapon = subSpecialWeaponMarkdownCodes[keySubSpecial];
  if (!!subSpecialWeapon) return <Image src={`/subs-specials/${subSpecialWeapon}.png`} width={32} height={32} />;

  const modeCode = modeCodes[value];
  if (!!modeCode)
    return <Image src={`/modes/${modeCode}.png`} width={32} height={32} />;

  return <>{props.value}</>;
};

export default Emoji;
