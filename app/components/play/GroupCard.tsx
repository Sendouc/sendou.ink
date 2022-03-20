import clsx from "clsx";
import { useFetcher } from "remix";
import { Button, ButtonProps } from "~/components/Button";
import type {
  LookingActionSchema,
  LookingLoaderDataGroup,
} from "~/routes/play/looking";
import { ArrowUpIcon } from "../icons/ArrowUp";
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
        return ranked ? "Let's play ranked?" : "Let's scrim?";
      case "UNLIKE":
        return "Undo";
      case "UNITE_GROUPS":
        return ownGroupRanked ? "Group up (ranked)" : "Group up (scrim)";
      case "MATCH_UP":
        return ranked ? "Match up (ranked)" : "Match up (scrim)";
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
            {ranked ? "Ranked" : "Scrim"}
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
            className={clsx({ "play__card__button-small": isOwnGroup })}
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
  const labelText = () => {
    switch (relation) {
      case "LOT_LOWER": {
        return "A lot lower";
      }
      case "LOWER": {
        return "Lower";
      }
      case "BIT_LOWER": {
        return "A bit lower";
      }
      case "CLOSE": {
        return "Close";
      }
      case "BIT_HIGHER": {
        return "A bit higher";
      }
      case "HIGHER": {
        return "Higher";
      }
      case "LOT_HIGHER": {
        return "A lot higher";
      }
    }
  };
  const gridColumn = () => {
    const relationsOrdered = [
      "LOW_LOWER",
      "LOWER",
      "BIT_LOWER",
      "CLOSE",
      "BIT_HIGHER",
      "HIGHER",
      "LOW_HIGHER",
    ];

    return {
      gridColumn: `${relationsOrdered.indexOf(relation) + 1} / ${
        relationsOrdered.indexOf(relation) + 2
      }`,
    };
  };

  return (
    <div className="play__card__mmr-relation-bar__container">
      <div className="play__card__mmr-relation-bar__label">
        {labelText()} SP
      </div>
      <div className="play__card__mmr-relation-bar">
        <div
          className={clsx("play__card__mmr-relation-bar__1", {
            "play__card__mmr-relation-bar__active": relation === "LOT_LOWER",
          })}
        />
        <div
          className={clsx("play__card__mmr-relation-bar__2", {
            "play__card__mmr-relation-bar__active": relation === "LOWER",
          })}
        />
        <div
          className={clsx("play__card__mmr-relation-bar__3", {
            "play__card__mmr-relation-bar__active": relation === "BIT_LOWER",
          })}
        />
        <div
          className={clsx("play__card__mmr-relation-bar__4", {
            "play__card__mmr-relation-bar__active": relation === "CLOSE",
          })}
        />
        <div
          className={clsx("play__card__mmr-relation-bar__5", {
            "play__card__mmr-relation-bar__active": relation === "BIT_HIGHER",
          })}
        />
        <div
          className={clsx("play__card__mmr-relation-bar__6", {
            "play__card__mmr-relation-bar__active": relation === "HIGHER",
          })}
        />
        <div
          className={clsx("play__card__mmr-relation-bar__7", {
            "play__card__mmr-relation-bar__active": relation === "LOT_HIGHER",
          })}
        />
      </div>
      <div className="play__card__mmr-relation-bar">
        <ArrowUpIcon
          className="play__card__mmr-relation-bar__indicator"
          style={gridColumn()}
        />
      </div>
    </div>
  );
}
