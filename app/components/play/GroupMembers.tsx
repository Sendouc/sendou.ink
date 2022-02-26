import type { LookingLoaderDataGroup } from "~/routes/play/looking";
import { layoutIcon } from "~/utils";
import { Avatar } from "../Avatar";
import { WeaponImage } from "../WeaponImage";

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
            <a
              href={`https://sendou.ink/u/${member.discordId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="play-looking__member-link"
            >
              <Avatar tiny user={member} />
              <span className="play-looking__member-name">
                {member.discordName}
              </span>
            </a>
            {member.MMR && (
              <div className="play-looking__member-mmr">SP: {member.MMR}</div>
            )}
            {member.peakXP && (
              <div className="play-looking__member-power">
                <img
                  src={layoutIcon("top500")}
                  width="18"
                  height="18"
                  title="Peak X Power"
                />{" "}
                {member.peakXP}
              </div>
            )}
            {member.peakLP && (
              <div className="play-looking__member-power league">
                <img
                  // TODO: actual league icon
                  src={layoutIcon("top500")}
                  width="18"
                  height="18"
                  title="Peak League Power"
                />{" "}
                {member.peakLP}
              </div>
            )}
            {member.weapons && (
              <div className="play-looking__member-weapons">
                {member.weapons.map((wpn) => (
                  <WeaponImage
                    className="play-looking__member-weapon"
                    key={wpn}
                    weapon={wpn}
                  />
                ))}{" "}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
