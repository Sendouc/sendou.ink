import type { LookingLoaderDataGroup } from "~/routes/play/looking";
import { Avatar } from "../Avatar";

export function GroupMembers({
  members,
}: {
  members: LookingLoaderDataGroup["members"];
}) {
  return (
    <div className="play-looking__card__members">
      <Contents members={members} />
    </div>
  );
}

function Contents({ members }: { members: LookingLoaderDataGroup["members"] }) {
  if (!members) {
    return (
      <>
        {new Array(4).fill(null).map((_, i) => {
          return (
            <div key={i} className="play-looking__member-card">
              <Avatar tiny user={{ discordId: "", discordAvatar: null }} />
              <span className="play-looking__member-name">???</span>
            </div>
          );
        })}
      </>
    );
  }

  return (
    <>
      {members?.map((member) => {
        return (
          <div key={member.id} className="play-looking__member-card">
            <Avatar tiny user={member} />
            <span className="play-looking__member-name">
              {member.discordName}
            </span>
            {member.MMR && (
              <div className="play-looking__member-mmr">MMR: {member.MMR}</div>
            )}
          </div>
        );
      })}
    </>
  );
}
