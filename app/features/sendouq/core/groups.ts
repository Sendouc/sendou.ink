import type { LookingGroup } from "../queries/lookingGroups.server";

// logic is that team who is bigger decides the settings
// but if groups are the same size then the one who liked
// is basically consenting that other team's setting are used
export function groupAfterMorph({
  ourGroup,
  theirGroup,
  liker,
}: {
  ourGroup: LookingGroup;
  theirGroup: LookingGroup;
  liker: "US" | "THEM";
}) {
  if (ourGroup.members.length > theirGroup.members.length) {
    return ourGroup;
  }

  if (theirGroup.members.length > ourGroup.members.length) {
    return theirGroup;
  }

  if (liker === "US") {
    return theirGroup;
  }

  return ourGroup;
}
