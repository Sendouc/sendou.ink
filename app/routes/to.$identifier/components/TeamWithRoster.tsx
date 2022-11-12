import clsx from "clsx";
import { Avatar } from "~/components/Avatar";
import { Button } from "~/components/Button";
import { TrashIcon } from "~/components/icons/Trash";
import type { FindTeamsByEventIdItem } from "~/db/models/tournaments/queries.server";
import { useUser } from "~/modules/auth";

export function TeamWithRoster({
  team,
  showDeleteButtons = false,
}: {
  team: FindTeamsByEventIdItem;
  showDeleteButtons?: boolean;
}) {
  const user = useUser();

  return (
    <div className="tournament__team-with-roster">
      <div className="tournament__team-with-roster__name">{team.name}</div>
      <ul className="tournament__team-with-roster__members">
        {team.members.map((member) => (
          <li
            key={member.userId}
            className="tournament__team-with-roster__member"
          >
            {showDeleteButtons && (
              <Button
                className={clsx({ invisible: user?.id === member.userId })}
                variant="minimal-destructive"
                tiny
                type="submit"
                name="id"
                value={member.userId}
              >
                <TrashIcon className="w-4" />
              </Button>
            )}
            <Avatar user={member} size="xxs" />
            {member.discordName}
          </li>
        ))}
      </ul>
    </div>
  );
}
