import * as React from "react";
import type { Mode } from "@prisma/client";
import { modesShortToLong } from "~/constants";
import {
  modeToImageUrl,
  MyCSSProperties,
  stageNameToBannerImageUrl,
} from "~/utils";
import clsx from "clsx";

export function FancyStageBanner({
  stage,
  roundNumber,
  infos,
  children,
}: {
  stage: { mode: Mode; name: string };
  roundNumber: number;
  infos?: JSX.Element[];
  children?: React.ReactNode;
}) {
  const style: MyCSSProperties = {
    "--_tournament-bg-url": `url("${stageNameToBannerImageUrl(stage.name)}")`,
  };

  return (
    <>
      <div
        className={clsx("tournament-bracket__stage-banner", {
          rounded: !infos,
        })}
        style={style}
      >
        <div className="tournament-bracket__stage-banner__top-bar">
          <h4 className="tournament-bracket__stage-banner__top-bar__header">
            <img
              className="tournament-bracket__stage-banner__top-bar__mode-image"
              src={modeToImageUrl(stage.mode)}
            />
            {modesShortToLong[stage.mode]} on {stage.name}
          </h4>
          <h4>Stage {roundNumber}</h4>
        </div>
        {children}
      </div>
      {infos && (
        <div className="tournament-bracket__infos">
          {infos.map((info, i) => (
            <div key={i}>{info}</div>
          ))}
        </div>
      )}
    </>
  );
}
