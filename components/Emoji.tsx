import AbilityIcon from "components/AbilityIcon";
import GearImage from "components/GearImage";
import WeaponImage from "components/WeaponImage";
import { abilityMarkdownCodes } from "lib/lists/abilityMarkdownCodes";
import { gearMarkdownCodes } from "lib/lists/gearMarkdownCodes";
import { weaponMarkdownCodes } from "lib/lists/weaponMarkdownCodes";
import Image from "next/image";

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

  const keyWeapon = value as keyof typeof weaponMarkdownCodes;
  const weaponName = weaponMarkdownCodes[keyWeapon];
  if (!!weaponName) return <WeaponImage name={weaponName} size={32} isInline />;

  const keyAbility = value as keyof typeof abilityMarkdownCodes;
  const abilityName = abilityMarkdownCodes[keyAbility];
  if (!!abilityName) return <AbilityIcon size="TINY" ability={abilityName} />;

  const keyGear = value as keyof typeof gearMarkdownCodes;
  const gearName = gearMarkdownCodes[keyGear];
  if (!!gearName) return <GearImage englishName={gearName} mini />;

  const modeCode = modeCodes[value];
  if (!!modeCode)
    return (
      <Image
        src={`/modes/${modeCode}.png`}
        style={{ display: "inline-block" }}
        width={32}
        height={32}
      />
    );

  return <>{props.value}</>;
};

export default Emoji;
