import { Ability } from ".prisma/client";
import Image from "next/image";
import { abilities } from "utils/lists/abilities";
import styles from "./AbilityIcon.module.css";

//https://github.com/loadout-ink/splat2-calc

const sizeMap = {
  MAIN: 50,
  SUB: 40,
  TINY: 30,
  SUBTINY: 20,
} as const;

interface AbilityIconProps {
  ability: Ability | "UNKNOWN";
  size: keyof typeof sizeMap;
  loading?: "eager";
}

const AbilityIcon: React.FC<AbilityIconProps> = ({
  ability,
  size,
  loading,
}) => {
  const sizeNumber = sizeMap[size];
  const abilityName = abilities.find((a) => a.code === ability)?.name;

  return (
    <div
      className={styles.container}
      style={
        {
          "--ability-size": `${sizeNumber}px`,
        } as any
      }
    >
      <Image
        src={`/abilityIcons/${ability}.png`}
        width={sizeNumber}
        height={sizeNumber}
        alt={abilityName}
        loading={loading ?? "lazy"}
        title={abilityName}
      />
    </div>
  );
};

export default AbilityIcon;
