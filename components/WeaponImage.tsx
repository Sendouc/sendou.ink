import { useTranslation } from "lib/useMockT";
import Image from "next/image";
import React from "react";

interface WeaponImageProps {
  name: string;
  size: 32 | 64 | 128;
  noTitle?: boolean;
  isInline?: boolean;
}

const WeaponImage: React.FC<WeaponImageProps> = ({
  name,
  size,
  noTitle,
  isInline,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Image
        src={`/images/weapons/${name.replace(".", "")}.png`}
        alt={t(`game;${name}`)}
        title={noTitle ? undefined : t(`game;${name}`)}
        width={size}
        height={size}
        style={{ display: isInline ? "inline-block" : undefined }}
      />
    </>
  );
};

export default WeaponImage;
