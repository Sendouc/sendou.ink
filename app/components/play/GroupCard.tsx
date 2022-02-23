import clsx from "clsx";
import { useFetcher } from "remix";
import { Button, ButtonProps } from "~/components/Button";
import type {
  LookingActionSchema,
  LookingLoaderDataGroup,
} from "~/routes/play/looking";
import { GroupMembers } from "./GroupMembers";

export function GroupCard({
  group,
  canTakeAction = false,
  type,
  ranked,
  lookingForMatch,
  isOwnGroup = false,
}: {
  group: LookingLoaderDataGroup;
  canTakeAction?: boolean;
  type?: "LIKES_GIVEN" | "NEUTRAL" | "LIKES_RECEIVED";
  ranked?: boolean;
  lookingForMatch: boolean;
  isOwnGroup?: boolean;
}) {
  const fetcher = useFetcher();

  const buttonText = () => {
    if (isOwnGroup) return "Stop looking";
    if (type === "LIKES_GIVEN") return "Undo";
    if (type === "NEUTRAL") return "Let's play?";

    return lookingForMatch ? "Match up" : "Group up";
  };
  const buttonValue = (): LookingActionSchema["_action"] => {
    if (isOwnGroup) return "LOOK_AGAIN";
    if (type === "LIKES_GIVEN") return "UNLIKE";
    if (type === "NEUTRAL") return "LIKE";

    return lookingForMatch ? "MATCH_UP" : "UNITE_GROUPS";
  };
  const buttonVariant = (): ButtonProps["variant"] => {
    if (isOwnGroup) return "minimal-destructive";

    return type === "LIKES_GIVEN" ? "destructive" : undefined;
  };

  return (
    <fetcher.Form method="post">
      <div className="play-looking__card">
        {typeof ranked === "boolean" && (
          <div className={clsx("play-looking__ranked-text", { ranked })}>
            {ranked ? "Ranked" : "Unranked"}
          </div>
        )}
        <GroupMembers members={group.members} />
        {group.teamMMR && (
          <div className="play-looking__mmr">
            MMR: {!group.teamMMR.exact && <>~</>}
            {group.teamMMR.value}
          </div>
        )}
        <input type="hidden" name="targetGroupId" value={group.id} />
        {type === "LIKES_RECEIVED" && (
          <input
            type="hidden"
            name="targetGroupSize"
            value={group.members?.length ?? -1}
          />
        )}
        {canTakeAction && (
          <Button
            className={
              isOwnGroup
                ? "play-looking__card__button-small"
                : "play-looking__card__button"
            }
            type="submit"
            name="_action"
            value={buttonValue()}
            tiny
            variant={buttonVariant()}
            loading={fetcher.state !== "idle"}
          >
            {buttonText()}
          </Button>
        )}
      </div>
    </fetcher.Form>
  );
}
