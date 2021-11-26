import mapPoolStylesUrl from "~/styles/map-pool.css";
import type { Mode } from ".prisma/client";
import classNames from "classnames";
import { modesShort, stages } from "~/utils";
import { LinksFunction, useMatches } from "remix";
import { FindTournamentByNameForUrlI } from "../../../../services/tournament";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: mapPoolStylesUrl }];
};

export default function MapPoolTab() {
  const [, parentRoute] = useMatches();
  const { mapPool } = parentRoute.data as FindTournamentByNameForUrlI;

  return (
    <div className="map-pool">
      <div className="map-pool__info-square">
        <span className="map-pool__info-square__text">
          {mapPool.length} maps
        </span>
      </div>
      {stages.map((stage) => (
        <div key={stage} className="map-pool__stage-images-container">
          <img
            className={classNames("map-pool__stage-image", {
              "map-pool__stage-image-disabled": !modesPerStage(mapPool)[stage],
            })}
            loading="lazy"
            alt={stage}
            src={`/img/stages/${stage.replaceAll(" ", "-").toLowerCase()}.webp`}
          />
          {modesPerStage(mapPool)[stage] && (
            <div className="map-pool__mode-images-container">
              {modesShort.map(
                (mode) =>
                  modesPerStage(mapPool)[stage]?.includes(mode as Mode) && (
                    <img
                      key={mode}
                      className="map-pool__mode-image"
                      src={`/img/modes/${mode}.webp`}
                      alt={mode}
                    />
                  )
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function modesPerStage(
  mapPool: {
    name: string;
    mode: Mode;
  }[]
) {
  return mapPool.reduce((acc: Record<string, Mode[]>, { name, mode }) => {
    if (!acc[name]) {
      acc[name] = [];
    }

    acc[name].push(mode);
    return acc;
  }, {});
}
