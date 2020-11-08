import { useLingui } from "@lingui/react";
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
  const { i18n } = useLingui();

  return (
    <>
      <Image
        src={`/images/weapons/${name.replace(".", "")}.png`}
        alt={i18n._(name)}
        title={noTitle ? undefined : i18n._(name)}
        width={size}
        height={size}
        style={{ display: isInline ? "inline-block" : undefined }}
      />
    </>
  );
};

export default WeaponImage;
