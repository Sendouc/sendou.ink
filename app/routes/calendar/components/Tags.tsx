import clsx from "clsx";
import React from "react";
import { useTranslation } from "~/hooks/useTranslation";
import { Badge } from "~/components/Badge";
import { Button } from "~/components/Button";
import { CrossIcon } from "~/components/icons/Cross";
import type { Badge as BadgeType, CalendarEventTag } from "~/db/types";
import allTags from "../tags.json";

export function Tags({
  tags,
  badges,
  onDelete,
}: {
  tags: Array<CalendarEventTag>;
  badges?: Array<BadgeType>;
  /** Called when tag delete button clicked. If undefined delete buttons won't be shown. */
  onDelete?: (tag: CalendarEventTag) => void;
}) {
  const { t } = useTranslation();

  if (tags.length === 0) return null;

  return (
    <ul className="calendar__event__tags">
      {tags.map((tag) => (
        <React.Fragment key={tag}>
          <li
            style={{ backgroundColor: allTags[tag].color }}
            className={clsx("calendar__event__tag", {
              "calendar__event__badge-tag": tag === "BADGE",
            })}
          >
            {t(`tag.name.${tag}`)}
            {onDelete && (
              <Button
                onClick={() => onDelete(tag)}
                className="calendar__event__tag-delete-button"
                icon={<CrossIcon />}
                variant="minimal"
                aria-label="Remove date"
                tiny
              />
            )}
            {tag === "BADGE" && badges && (
              <div className="calendar__event__tag-badges">
                {badges.map((badge) => (
                  <Badge key={badge.id} badge={badge} size={20} isAnimated />
                ))}
              </div>
            )}
          </li>
        </React.Fragment>
      ))}
    </ul>
  );
}
