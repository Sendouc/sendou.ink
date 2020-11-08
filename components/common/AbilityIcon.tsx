import Image from "next/image";

//https://github.com/loadout-ink/splat2-calc

const sizeMap = {
  MAIN: 50,
  SUB: 40,
  TINY: 30,
  SUBTINY: 20,
} as const;

interface AbilityIconProps {
  // FIXME: use enum from generated/graphql.tsx
  ability: string | "EMPTY";
  size: "MAIN" | "SUB" | "TINY" | "SUBTINY";
}

const AbilityIcon: React.FC<AbilityIconProps> = ({ ability, size }) => {
  const sizeNumber = sizeMap[size];

  return (
    <Image
      src={`/abilityIcons/${ability}.png`}
      width={sizeNumber}
      height={sizeNumber}
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
      }}
      alt={ability}
    />
  );
};

export default AbilityIcon;
