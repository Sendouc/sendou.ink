import { badgeUrl } from "~/utils/urls";
import { Image } from "./Image";
import type * as CalendarRepository from "~/features/calendar/CalendarRepository.server";

export function Badge({
  badge,
  onClick,
  isAnimated,
  size,
}: {
  badge: CalendarRepository.FindAllBetweenTwoTimestampsItem["badgePrizes"][number];
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
