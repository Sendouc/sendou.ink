import { Link } from "@remix-run/react";
import { WeaponImage } from "~/components/Image";
import type { SplatoonPlacement } from "~/db/types";
import { xSearchPlayerPage } from "~/utils/urls";

type PlacementTablePlacement = Pick<
  SplatoonPlacement,
  | "weaponSplId"
  | "name"
  | "power"
  | "rank"
  | "team"
  | "month"
  | "year"
  | "type"
  | "region"
  | "playerId"
>;
interface PlacementsProps {
  placements: Array<PlacementTablePlacement>;
}

export function PlacementsTable({ placements }: PlacementsProps) {
  return (
    <div className="placements__table">
      {placements.map((placement) => (
        <Link
          to={xSearchPlayerPage(placement.playerId)}
          key={placementId(placement)}
          className="placements__table__row"
        >
          <div className="placements__table__inner-row">
            <div className="placements__table__rank">{placement.rank}</div>
            <WeaponImage
              className="placements__table__weapon"
              variant="build"
              weaponSplId={placement.weaponSplId}
              width={32}
            />
            <div>{placement.name}</div>
          </div>
          <div>{placement.power}</div>
        </Link>
      ))}
    </div>
  );
}

function placementId(placement: PlacementTablePlacement) {
  return `${placement.rank}-${placement.month}-${placement.year}-${
    placement.type
  }-${placement.region}-${placement.team ?? ""}`;
}
