import { ModeImage } from "~/components/Image";
import type { Group } from "~/db/types";
import { assertUnreachable } from "~/utils/types";

const SZOnly = () => <ModeImage mode="SZ" size={16} />;

const AllModes = () => (
  <>
    <ModeImage mode="SZ" size={16} />
    <ModeImage mode="TC" size={16} />
    <ModeImage mode="RM" size={16} />
    <ModeImage mode="CB" size={16} />
  </>
);

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
      case "PREFER_SZ":
        return ">";
      default:
        assertUnreachable(preference);
    }
  })();

  return (
    <>
      {["SZ_ONLY", "PREFER_SZ"].includes(preference) ? <SZOnly /> : null}
      {["ALL_MODES_ONLY", "PREFER_ALL_MODES", "NO_PREFERENCE"].includes(
        preference,
      ) ? (
        <AllModes />
      ) : null}
      {comparisonSign ? (
        <span className="text-main-forced">{comparisonSign}</span>
      ) : null}
      {["PREFER_SZ"].includes(preference) ? <AllModes /> : null}
      {["PREFER_ALL_MODES", "NO_PREFERENCE"].includes(preference) ? (
        <SZOnly />
      ) : null}
    </>
  );
}
