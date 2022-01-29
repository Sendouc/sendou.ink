import { json, LoaderFunction, redirect, useLoaderData } from "remix";
import { LFG_GROUP_FULL_SIZE } from "~/constants";
import * as LFGGroup from "~/models/LFGGroup.server";
import { requireUser } from "~/utils";

interface LookingLoaderData {
  groups: {
    id: string;
    members?: {
      discordId: string;
      discordAvatar: string | null;
      discordName: string;
      discordDiscriminator: string;
    }[];
  }[];
}

export const loader: LoaderFunction = async ({ context }) => {
  const user = requireUser(context);
  const ownGroup = await LFGGroup.findActiveByMember(user);
  if (!ownGroup) return redirect("/play");
  if (!ownGroup.looking) return redirect("/play/add-players");

  const groups = await LFGGroup.findLookingByType(
    ownGroup.type,
    ownGroup.ranked
  );

  // For example if we have a group of 3 and group type is QUAD we only want to consider groups of size 1
  // .. if we have a group size of 2 then we can consider groups of size 1 or 2 and so on
  const maxGroupSizeToConsider = (() => {
    if (ownGroup.type === "TWIN") return 1;

    return LFG_GROUP_FULL_SIZE - ownGroup.members.length;
  })();

  const lookingForMatch = ownGroup.members.length === LFG_GROUP_FULL_SIZE;
  return json<LookingLoaderData>({
    groups: groups
      .filter((group) => group.members.length <= maxGroupSizeToConsider)
      .map((group) => ({
        id: group.id,
        // When looking for a match ranked groups are censored
        // and instead we only reveal their approximate skill level
        members:
          group.ranked && lookingForMatch
            ? undefined
            : group.members.map((member) => member.user),
      })),
  });
};

export default function LookingPage() {
  const data = useLoaderData<LookingLoaderData>();

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
