import React from "react";
import { useTranslation } from "react-i18next";
import { Weapon } from "../../types.js";
import english_internal from "../../utils/english_internal.json";

interface WeaponImageProps {
  englishName: Weapon;
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

  return (
    <>
      <img
        src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/weapons/Wst_${english_internal[englishName]}.png`}
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
