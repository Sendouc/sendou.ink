import englishToInternal from "lib/englishToInternal.json";
import { useTranslation } from "lib/useMockT";
import React from "react";

interface WeaponImageProps {
  englishName: string;
  size: "SMALL" | "SMEDIUM" | "MEDIUM" | "BIG";
  asInlineBlock?: boolean;
  noTitle?: boolean;
}

const sizeWhMap: Record<
  "SMALL" | "SMEDIUM" | "MEDIUM" | "BIG",
  string | undefined
> = {
  SMALL: "32px",
  SMEDIUM: "48px",
  MEDIUM: "64px",
  BIG: undefined,
};

const WeaponImage: React.FC<WeaponImageProps> = ({
  englishName,
  size,
  asInlineBlock,
  noTitle,
}) => {
  const { t } = useTranslation();
  const wh = sizeWhMap[size];

  const key = englishName as keyof typeof englishToInternal;
  const weaponInternal = englishToInternal[key];

  return (
    <>
      <img
        src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/weapons/Wst_${weaponInternal}.png`}
        alt={t(`game;${englishName}`)}
        title={noTitle ? undefined : t(`game;${englishName}`)}
        style={{
          width: wh,
          height: wh,
          display: asInlineBlock ? "inline-block" : undefined,
        }}
      />
    </>
  );
};

export default WeaponImage;
