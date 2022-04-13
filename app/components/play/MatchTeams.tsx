import clsx from "clsx";
import { useLoaderData } from "remix";
import { LFGMatchLoaderData } from "~/routes/play/match.$id";
import { userFullDiscordName } from "~/utils";
import { weaponsInGameOrder } from "~/utils/sorters";
import {
  oldSendouInkPlayerProfile,
  oldSendouInkUserProfile,
} from "~/utils/urls";
import { Avatar } from "../Avatar";
import { WeaponImage } from "../WeaponImage";

// TODO: make the whole thing one grid to align stuff better
export function MatchTeams() {
  const data = useLoaderData<LFGMatchLoaderData>();

  const detailedGroups = (() => {
    if (!data.mapList.some((map) => map.detail)) return;

    const result: {
      [groupId: string]: {
        weapons: Set<string>;
        name: string;
        principalId: string;
      }[];
    } = { [data.groups[0].id]: [], [data.groups[1].id]: [] };

    for (const stage of data.mapList) {
      if (typeof stage.winner !== "number") break;

      for (const team of stage.detail?.teams ?? []) {
        const groupId =
          data.groups[team.isWinner ? stage.winner : Number(!stage.winner)].id;

        for (const player of team.players) {
          const playerObj = result[groupId].find(
            (p) => p.principalId === player.principalId
          );
          if (playerObj) playerObj.weapons.add(player.weapon);
          else {
            result[groupId].push({
              name: player.name,
              principalId: player.principalId,
              weapons: new Set([player.weapon]),
            });
          }
        }
      }
    }

    return result;
  })();

  return (
    <div className="play-match__teams">
      {data.groups.map((g, i) => {
        return (
          <div
            key={g.id}
            className="play-match__waves-section play-match__team-info"
          >
            {detailedGroups ? (
              <>
                {detailedGroups[g.id].map((player) => (
                  <a
                    key={player.principalId}
                    href={oldSendouInkPlayerProfile({
                      principalId: player.principalId,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="play-match__player">
                      <span className="play-match__player-name">
                        {player.name}
                      </span>
                      <span className="play-match__weapons">
                        {Array.from(player.weapons)
                          .sort(weaponsInGameOrder)
                          .map((weapon) => (
                            <WeaponImage
                              className="play-match__weapon-img"
                              key={weapon}
                              weapon={weapon}
                            />
                          ))}
                      </span>
                    </div>
                  </a>
                ))}
                <div className="play-match__player-list">
                  {g.members.map((user) => (
                    <a
                      key={user.id}
                      href={oldSendouInkUserProfile({
                        discordId: user.discordId,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="play-match__player row">
                        <span className="play-match__player-name">
                          {user.discordName}#{user.discordDiscriminator}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </>
            ) : (
              g.members.map((user) => (
                <a
                  key={user.id}
                  href={oldSendouInkUserProfile({
                    discordId: user.discordId,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={userFullDiscordName(user)}
                >
                  <div className="play-match__player">
                    <Avatar user={user} />
                    <span className="play-match__player-name">
                      {user.discordName}
                    </span>
                  </div>
                </a>
              ))
            )}
            {data.scores && (
              <div
                className={clsx("play-match__score", {
                  winner: data.scores[i] === Math.max(...data.scores),
                })}
              >
                {data.scores[i]}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
