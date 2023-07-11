import type { Group } from "~/db/types";
import {
  SENDOUQ_LOOKING_PAGE,
  SENDOUQ_PAGE,
  SENDOUQ_PREPARING_PAGE,
  sendouQMatchPage,
} from "~/utils/urls";

function groupRedirectLocation(
  group?: Pick<Group, "status"> & { matchId?: number }
) {
  if (group?.status === "PREPARING") return SENDOUQ_PREPARING_PAGE;
  if (group?.matchId) return sendouQMatchPage(group.matchId);
  if (group) return SENDOUQ_LOOKING_PAGE;

  return SENDOUQ_PAGE;
}

export function groupRedirectLocationByCurrentLocation({
  group,
  currentLocation,
}: {
  group?: Pick<Group, "status"> & { matchId?: number };
  currentLocation: "default" | "preparing" | "looking" | "match";
}) {
  const newLocation = groupRedirectLocation(group);

  // we are already in the correct location, don't redirect
  if (currentLocation === "default" && newLocation === SENDOUQ_PAGE) return;
  if (currentLocation === "preparing" && newLocation === SENDOUQ_PREPARING_PAGE)
    return;
  if (currentLocation === "looking" && newLocation === SENDOUQ_LOOKING_PAGE)
    return;
  if (currentLocation === "match" && newLocation.includes("match")) return;

  return newLocation;
}
