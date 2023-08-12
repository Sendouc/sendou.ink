import { ModeImage } from "~/components/Image";
import type { Group } from "~/db/types";
import { assertUnreachable } from "~/utils/types";

export function ModePreferenceIcons({
  preference,
}: {
  preference: Group["mapListPreference"];
}) {
  const comparisonSign = (() => {
    switch (preference) {
      case "SZ_ONLY":
      case "ALL_MODES_ONLY":
        return null;
      case "NO_PREFERENCE":
        return "=";
      case "PREFER_ALL_MODES":
        return "<";
      case "PREFER_SZ":
        return ">";
      default:
        assertUnreachable(preference);
    }
  })();

  return (
    <>
      {preference !== "ALL_MODES_ONLY" ? (
        <ModeImage mode="SZ" size={16} />
      ) : null}
      {comparisonSign ? (
        <span className="text-main-forced">{comparisonSign}</span>
      ) : null}
      {preference !== "SZ_ONLY" ? (
        <>
          <ModeImage mode="SZ" size={16} />
          <ModeImage mode="TC" size={16} />
          <ModeImage mode="RM" size={16} />
          <ModeImage mode="CB" size={16} />
        </>
      ) : null}
    </>
  );
}
