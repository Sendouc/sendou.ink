import { useLingui } from "@lingui/react";
import englishToInteral from "lib/englishToInternal.json";
import React from "react";

interface GearImageProps {
  englishName: string;
  mini?: boolean;
}

const GearImage: React.FC<GearImageProps> = ({ englishName, mini }) => {
  const { i18n } = useLingui();
  const wh = "32px";

  const key = englishName as keyof typeof englishToInteral;
  const gearInternal = englishToInteral[key];
  return (
    <img
      alt={i18n._(englishName)}
      src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/gear/${gearInternal}.png`}
      title={i18n._(englishName)}
      style={
        mini ? { width: wh, height: wh, display: "inline-block" } : undefined
      }
    />
  );
};

export default GearImage;
