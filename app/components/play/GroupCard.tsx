import clsx from "clsx";
import { Form } from "remix";
import { Button } from "~/components/Button";
import type {
  LookingActionSchema,
  LookingLoaderDataGroup,
} from "~/routes/play/looking";
import { GroupMembers } from "./GroupMembers";

export function GroupCard({
  group,
  isCaptain = false,
  type,
  ranked,
  lookingForMatch,
}: {
  group: LookingLoaderDataGroup;
  isCaptain?: boolean;
  type?: "LIKES_GIVEN" | "NEUTRAL" | "LIKES_RECEIVED";
  ranked?: boolean;
  lookingForMatch: boolean;
}) {
  const buttonText = () => {
    if (type === "LIKES_GIVEN") return "Undo";
    if (type === "NEUTRAL") return "Let's play?";

    return lookingForMatch ? "Match up" : "Group up";
  };
  const buttonValue = (): LookingActionSchema["_action"] => {
    if (type === "LIKES_GIVEN") return "UNLIKE";
    if (type === "NEUTRAL") return "LIKE";

    return lookingForMatch ? "MATCH_UP" : "UNITE_GROUPS";
  };

  return (
    <Form method="post">
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
        {isCaptain && (
          <Button
            className="play-looking__card__button"
            type="submit"
            name="_action"
            value={buttonValue()}
            tiny
            variant={type === "LIKES_GIVEN" ? "destructive" : undefined}
          >
            {buttonText()}
          </Button>
        )}
      </div>
    </Form>
  );
}
