import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/Button";
import { CrossIcon } from "~/components/icons/Cross";
import type { CalendarEventTag } from "~/db/types";
import allTags from "../tags.json";

export function Tags({
  tags,
  onDelete,
}: {
  tags: Array<CalendarEventTag>;
  /** Called when tag delete button clicked. If undefined delete buttons won't be shown. */
  onDelete?: (tag: CalendarEventTag) => void;
}) {
  const { t } = useTranslation("calendar");

  if (tags.length === 0) return null;

  return (
    <ul className="calendar__event__tags">
      {tags.map((tag) => (
        <React.Fragment key={tag}>
          <li style={{ backgroundColor: allTags[tag].color }}>
            {t(`tag.name.${tag}`)}
            {onDelete && (
              <Button
                onClick={() => onDelete(tag)}
                className="calendar__event__tag-delete-button"
                icon={<CrossIcon />}
                variant="minimal"
                aria-label="Remove date"
                tiny
                data-cy="tag-delete-button"
              />
            )}
          </li>
        </React.Fragment>
      ))}
    </ul>
  );
}
