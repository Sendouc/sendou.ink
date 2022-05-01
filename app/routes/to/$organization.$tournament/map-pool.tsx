import { LinksFunction } from "@remix-run/node";
import clsx from "clsx";
import { modesShort, stages } from "~/core/stages/stages";
import styles from "~/styles/tournament-map-pool.css";
import { modeToImageUrl, stageNameToImageUrl } from "~/utils";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export default function MapPoolTab() {
  const mapPool = [];

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
