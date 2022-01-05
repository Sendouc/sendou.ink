import styles from "~/styles/tournament-map-pool.css";
import type { Mode } from ".prisma/client";
import clsx from "clsx";
import { modesShort, stages } from "~/constants";
import { LinksFunction, useMatches } from "remix";
import { FindTournamentByNameForUrlI } from "~/services/tournament";
import { modeToImageUrl, stageNameToImageUrl } from "~/utils";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
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
            className={clsx("map-pool__stage-image", {
              "map-pool__stage-image-disabled": !modesPerStage(mapPool)[stage],
            })}
            loading="lazy"
            alt={stage}
            src={stageNameToImageUrl(stage)}
          />
          {modesPerStage(mapPool)[stage] && (
            <div className="map-pool__mode-images-container">
              {modesShort.map(
                (mode) =>
                  modesPerStage(mapPool)[stage]?.includes(mode) && (
                    <img
                      key={mode}
                      className="map-pool__mode-image"
                      src={modeToImageUrl(mode)}
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
