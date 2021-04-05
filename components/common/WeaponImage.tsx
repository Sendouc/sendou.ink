import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import Image from "next/image";
import React from "react";

interface WeaponImageProps {
  name: string;
  size: 32 | 64 | 128;
  noTitle?: boolean;
}

const WeaponImage: React.FC<WeaponImageProps> = ({ name, size, noTitle }) => {
  const { i18n } = useLingui();
  const imageSrc = name
    ? `/weapons/${name.replace(".", "").trim()}.png`
    : "/placeholder.png";
  return (
    <Image
      src={imageSrc}
      alt={i18n._(name)}
      title={getTitle()}
      width={size}
      height={size}
    />
  );

  function getTitle() {
    if (noTitle) return undefined;
    if (name === "RANDOM") return t`Random`;
    if (name === "RANDOM_GRIZZCO") return t`Random (Grizzco)`;

    return i18n._(name);
  }
};

export default WeaponImage;
