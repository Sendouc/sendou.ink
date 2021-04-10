import { Ability } from ".prisma/client";
import { Box } from "@chakra-ui/react";
import Image from "next/image";
import { abilities } from "utils/lists/abilities";

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
    <Box
      style={{
        zIndex: 2,
        borderRadius: "50%",
        background: "#000",
        border: "2px solid #888",
        borderRight: "0px",
        borderBottom: "0px",
        backgroundSize: "100%",
        boxShadow: "0 0 0 1px #000",
        userSelect: "none",
        display: "inline-block",
        width: sizeNumber,
        height: sizeNumber,
      }}
    >
      <Image
        src={`/abilityIcons/${ability}.png`}
        width={sizeNumber}
        height={sizeNumber}
        alt={abilityName}
        loading={loading ?? "lazy"}
        title={abilityName}
      />
    </Box>
  );
};

export default AbilityIcon;
