import { useTranslation } from "react-i18next";
import type { CalendarEventTag } from "~/db/types";
import allTags from "../tags.json";

export function Tags({ tags }: { tags: Array<CalendarEventTag> }) {
  const { t } = useTranslation("calendar");

  if (tags.length === 0) return null;

  return (
    <ul className="calendar__event__tags">
      {tags.map((tag) => (
        <li key={tag} style={{ backgroundColor: allTags[tag].color }}>
          {t(`tag.${tag}`)}
        </li>
      ))}
    </ul>
  );
}
