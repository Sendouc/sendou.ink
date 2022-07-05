import type { Badge as BadgeDBType } from "~/db/types";
import { badgeUrl } from "~/utils/urls";
import { Image } from "./Image";

export function Badge({
  badge,
  onClick,
  isAnimated,
  size,
}: {
  badge: Pick<BadgeDBType, "displayName" | "code" | "hue">;
  onClick?: () => void;
  isAnimated: boolean;
  size: number;
}) {
  const commonProps = {
    title: badge.displayName,
    onClick,
    width: size,
    height: size,
    style: badge.hue ? { filter: `hue-rotate(${badge.hue}deg)` } : undefined,
  };

  if (isAnimated) {
    return (
      <img
        src={badgeUrl({ code: badge.code, extension: "gif" })}
        alt={badge.displayName}
        {...commonProps}
      />
    );
  }

  return (
    <Image
      path={badgeUrl({ code: badge.code })}
      alt={badge.displayName}
      {...commonProps}
    />
  );
}
