import englishToInteral from "lib/englishToInternal.json";
import { useTranslation } from "lib/useMockT";
import React from "react";

interface GearImageProps {
  englishName: string;
  mini?: boolean;
}

const GearImage: React.FC<GearImageProps> = ({ englishName, mini }) => {
  const { t } = useTranslation();
  const wh = "32px";

  const key = englishName as keyof typeof englishToInteral;
  const gearInternal = englishToInteral[key];
  return (
    <img
      alt={t(`game;${englishName}`)}
      src={`https://raw.githubusercontent.com/Leanny/leanny.github.io/master/splat2/gear/${gearInternal}.png`}
      title={t(`game;${englishName}`)}
      style={
        mini ? { width: wh, height: wh, display: "inline-block" } : undefined
      }
    />
  );
};

export default GearImage;
