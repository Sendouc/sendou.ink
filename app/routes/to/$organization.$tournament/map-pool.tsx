import { json, LinksFunction, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import { modesShort, stages } from "~/core/stages/stages";
import { db } from "~/db";
import { Mode, Stage } from "~/db/types";
import styles from "~/styles/tournament-map-pool.css";
import { modeToImageUrl, notFoundIfFalsy, stageNameToImageUrl } from "~/utils";
import { tournamentParamsSchema } from "../$organization.$tournament";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

interface MapPoolTabLoaderData {
  stages: Stage[];
}

export const loader: LoaderFunction = ({ params }) => {
  const namesForUrl = tournamentParamsSchema.parse(params);
  const tournament = notFoundIfFalsy(
    db.tournament.findByNamesForUrl(namesForUrl)
  );

  return json<MapPoolTabLoaderData>({
    stages: db.tournament.mapPool(tournament.id),
  });
};

export default function MapPoolTab() {
  const data = useLoaderData<MapPoolTabLoaderData>();

  const groupedStages = modesPerStage(data.stages);

  return (
    <div className="map-pool">
      <div className="map-pool__info-square">
        <span className="map-pool__info-square__text">
          {stages.length} maps
        </span>
      </div>
      {stages.map((stage) => (
        <div key={stage} className="map-pool__stage-images-container">
          <img
            className={clsx("map-pool__stage-image", {
              "map-pool__stage-image-disabled": !groupedStages[stage],
            })}
            loading="lazy"
            src={stageNameToImageUrl(stage)}
          />
          {groupedStages[stage] && (
            <div className="map-pool__mode-images-container">
              {modesShort.map(
                (mode) =>
                  groupedStages[stage]?.includes(mode) && (
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
