import { Link } from "@remix-run/react";
import { Image, WeaponImage } from "~/components/Image";
import { modeImageUrl, xSearchPlayerPage } from "~/utils/urls";
import { monthYearToSpan } from "../placements-utils";
import type { FindPlacement } from "../queries/findPlacements.server";

interface PlacementsTableProps {
  placements: Array<FindPlacement>;
  type?: "PLAYER_NAME" | "MODE_INFO";
}

export function PlacementsTable({
  placements,
  type = "PLAYER_NAME",
}: PlacementsTableProps) {
  return (
    <div className="placements__table">
      {placements.map((placement) => (
        <Link
          to={xSearchPlayerPage(placement.playerId)}
          key={placement.id}
          className="placements__table__row"
        >
          <div className="placements__table__inner-row">
            <div className="placements__table__rank">{placement.rank}</div>
            {type === "MODE_INFO" ? (
              <div className="placements__table__mode">
                <Image alt="" path={modeImageUrl(placement.mode)} width={24} />
              </div>
            ) : null}
            <WeaponImage
              className="placements__table__weapon"
              variant="build"
              weaponSplId={placement.weaponSplId}
              width={32}
            />
            {type === "PLAYER_NAME" ? <div>{placement.name}</div> : null}
            {type === "MODE_INFO" ? (
              <div className="placements__time">
                {monthYearToSpan(placement).from.month}/
                {monthYearToSpan(placement).from.year} -{" "}
                {monthYearToSpan(placement).to.month}/
                {monthYearToSpan(placement).to.year}
              </div>
            ) : null}
          </div>
          <div>{placement.power}</div>
        </Link>
      ))}
    </div>
  );
}
