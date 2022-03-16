import { LFGMatchLoaderData } from "~/routes/play/match.$id";
import { Unpacked } from "~/utils";
import { WeaponImage } from "../WeaponImage";
import SplatnetIcon from "./SplatnetIcon";

export function DetailedPlayers({
  players,
  bravo,
}: {
  players: Unpacked<
    NonNullable<Unpacked<LFGMatchLoaderData["mapList"]>["detail"]>["teams"]
  >["players"];
  bravo?: boolean;
}) {
  return (
    <div className="play-match__teams-players">
      {players
        .sort((a, b) => b.assists + b.kills - (a.assists + a.kills))
        .map((player) => (
          <div key={player.principalId} className="play-match__player-row">
            <WeaponImage
              className="play-match__player-row__weapon"
              weapon={player.weapon}
            />
            <div className="play-match__player-row__name">
              {player.name}
              <div className="play-match__player-row__paint">
                {player.paint}p
              </div>
            </div>
            <div className="play-match__player-row__splat-net-icons">
              <SplatnetIcon
                icon="kills"
                count={player.kills + player.assists}
                smallCount={player.assists}
                bravo={bravo}
              />
              <SplatnetIcon icon="deaths" count={player.deaths} bravo={bravo} />
              <SplatnetIcon
                // @ts-expect-error Elsewhere making sure player.weapon is in fact a weapon
                icon={player.weapon}
                count={player.specials}
                bravo={bravo}
              />
            </div>
          </div>
        ))}
    </div>
  );
}
