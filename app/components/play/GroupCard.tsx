import clsx from "clsx";
import { useFetcher } from "remix";
import { Button, ButtonProps } from "~/components/Button";
import type {
  LookingActionSchema,
  LookingLoaderDataGroup,
} from "~/routes/play/looking";
import { ArrowDownIcon } from "../icons/ArrowDown";
import { ArrowUpIcon } from "../icons/ArrowUp";
import { DoubleArrowDownIcon } from "../icons/DoubleArrowDown";
import { DoubleArrowUpIcon } from "../icons/DoubleArrowUp";
import { MinusIcon } from "../icons/Minus";
import { GroupMembers } from "./GroupMembers";

export function GroupCard({
  group,
  action,
  showAction,
  ranked,
  ownGroupRanked,
  isOwnGroup = false,
}: {
  group: LookingLoaderDataGroup;
  action?: Exclude<LookingActionSchema["_action"], "UNEXPIRE">;
  showAction: boolean;
  ranked?: boolean;
  ownGroupRanked?: boolean;
  isOwnGroup?: boolean;
}) {
  const fetcher = useFetcher();

  const buttonText = (ranked = false) => {
    switch (action) {
      case "LEAVE_GROUP":
        return "Leave group";
      case "LIKE":
        return ranked ? "Let's play ranked?" : "Let's play unranked?";
      case "UNLIKE":
        return "Undo";
      case "UNITE_GROUPS":
        return ownGroupRanked ? "Group up (ranked)" : "Group up (unranked)";
      case "MATCH_UP":
        return ranked ? "Match up (ranked)" : "Match up (unranked)";
      case "LOOK_AGAIN":
        return "Stop looking";
      default:
        throw new Error(`Invalid group action type: ${action ?? "UNDEFINED"}`);
    }
  };
  const buttonVariant = (): ButtonProps["variant"] => {
    switch (action) {
      case "LEAVE_GROUP":
      case "LOOK_AGAIN":
        return "minimal-destructive";
      case "UNLIKE":
        return "destructive";
      default:
        return undefined;
    }
  };

  return (
    <fetcher.Form method="post">
      <div className="play__card">
        {typeof ranked === "boolean" && (
          <div className={clsx("play__card__ranked-text", { ranked })}>
            {ranked ? "Ranked" : "Unranked"}
          </div>
        )}
        <GroupMembers members={group.members} />
        {group.MMRRelation && !group.replay && (
          <MMRRelation relation={group.MMRRelation} />
        )}
        {group.replay && <div className="play__card__replay">Replay</div>}
        <input type="hidden" name="targetGroupId" value={group.id} />
        {action === "UNITE_GROUPS" && (
          <input
            type="hidden"
            name="targetGroupSize"
            value={group.members?.length ?? -1}
          />
        )}
        {showAction && (
          <Button
            className={
              isOwnGroup ? "play__card__button-small" : "play__card__button"
            }
            type="submit"
            name="_action"
            value={action}
            tiny
            variant={buttonVariant()}
            loading={fetcher.state !== "idle"}
          >
            {buttonText(group.ranked)}
          </Button>
        )}
      </div>
    </fetcher.Form>
  );
}

function MMRRelation({
  relation,
}: {
  relation: NonNullable<LookingLoaderDataGroup["MMRRelation"]>;
}) {
  switch (relation) {
    case "CLOSE": {
      return (
        <div className="play__card__mmr-relation">
          <MinusIcon /> Close SP
        </div>
      );
    }
    case "BIT_HIGHER": {
      return (
        <div className="play__card__mmr-relation">
          <ArrowUpIcon /> A bit higher SP
        </div>
      );
    }
    case "BIT_LOWER": {
      return (
        <div className="play__card__mmr-relation">
          <ArrowDownIcon /> A bit lower SP
        </div>
      );
    }
    case "HIGHER": {
      return (
        <div className="play__card__mmr-relation">
          <DoubleArrowUpIcon /> Higher SP
        </div>
      );
    }
    case "LOWER": {
      return (
        <div className="play__card__mmr-relation">
          <DoubleArrowDownIcon /> Lower SP
        </div>
      );
    }
    default: {
      const exhaustive: never = relation;
      throw new Error(`Unknown relation: ${JSON.stringify(exhaustive)}`);
    }
  }
}
