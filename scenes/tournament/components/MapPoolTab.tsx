import { For, Show } from "solid-js";
import { modesShort, stages } from "../../../utils/constants";
import { useTournamentData } from "../TournamentPage.data";
import s from "../styles/MapPoolTab.module.css";
import type { Mode } from ".prisma/client";

export function MapPoolTab() {
  const tournament = useTournamentData(1);

  return (
    <Show when={tournament?.()}>
      {({ mapPool }) => (
        <div class={s.container}>
          <div class={s.infoSquare}>
            <span class={s.emphasizedText}>{mapPool.length} maps</span>
          </div>
          <For each={stages}>
            {(stage) => (
              <div class={s.stageImageContainer}>
                <img
                  class={s.stageImage}
                  classList={{ [s.disabled]: !modesPerStage(mapPool)[stage] }}
                  loading="lazy"
                  alt={stage}
                  src={`/img/stages/${stage
                    .replaceAll(" ", "-")
                    .toLowerCase()}.webp`}
                />
                {modesPerStage(mapPool)[stage] && (
                  <div class={s.modeImagesContainer}>
                    {modesShort.map((mode) => {
                      if (
                        !modesPerStage(mapPool)[stage]?.includes(mode as Mode)
                      ) {
                        return null;
                      }
                      return (
                        <img
                          class={s.modeImage}
                          src={`/img/modes/${mode}.webp`}
                          alt={mode}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </For>
        </div>
      )}
    </Show>
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
