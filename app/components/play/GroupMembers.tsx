import type { LookingLoaderDataGroup } from "~/routes/play/looking";
import { layoutIcon } from "~/utils";
import { oldSendouInkUserProfile } from "~/utils/urls";
import { Avatar } from "../Avatar";
import { Popover } from "../Popover";
import { WeaponImage } from "../WeaponImage";

export function GroupMembers({
  members,
}: {
  members: LookingLoaderDataGroup["members"];
}) {
  return (
    <div className="play__card__members">
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
            <div key={i} className="play__card__member-card">
              <Avatar
                size="tiny"
                user={{ discordId: "", discordAvatar: null }}
              />
              <span className="play__card__member-name">???</span>
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
          <div key={member.id} className="play__card__member-card">
            <a
              href={oldSendouInkUserProfile({ discordId: member.discordId })}
              target="_blank"
              rel="noopener noreferrer"
              className="play__card__member-link"
            >
              <Avatar size="tiny" user={member} />
              <span className="play__card__member-name">
                {member.discordName}{" "}
                {member.captain && (
                  <span className="play__card__captain">C</span>
                )}
              </span>
            </a>
            {member.MMR && (
              <div className="play__card__member-mmr">SP: {member.MMR}</div>
            )}
            {member.peakXP && (
              <div className="play__card__member-power">
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
              <div className="play__card__member-power league">
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
              <div className="play__card__member-weapons">
                {member.weapons.map((wpn) => (
                  <WeaponImage
                    className="play__card__member-weapon"
                    key={wpn}
                    weapon={wpn}
                  />
                ))}{" "}
              </div>
            )}
            <div className="play__card__info">
              {member.miniBio && (
                <Popover trigger="INFO">{member.miniBio}</Popover>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
