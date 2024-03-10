import * as React from "react";

import { Dialog } from "~/components/Dialog";
import { generateTournamentRoundMaplist } from "../core/toMapList";
import type { Bracket } from "../core/Bracket";
import { useTournamentToSetMapPool } from "~/features/tournament/routes/to.$id";
import invariant from "tiny-invariant";
import type { TournamentRoundMaps } from "~/db/tables";
import { useTranslation } from "react-i18next";
import { ModeImage, StageImage } from "~/components/Image";
import { Button } from "~/components/Button";
import { RefreshArrowsIcon } from "~/components/icons/RefreshArrows";
import type { ModeShort, StageId } from "~/modules/in-game-lists";
import { SubmitButton } from "~/components/SubmitButton";
import { useFetcher } from "@remix-run/react";

export function BracketMapListDialog({
  isOpen,
  close,
  bracket,
  bracketIdx,
}: {
  isOpen: boolean;
  close: () => void;
  bracket: Bracket;
  bracketIdx: number;
}) {
  const { t } = useTranslation(["tournament"]);
  const toSetMapPool = useTournamentToSetMapPool();
  const fetcher = useFetcher();

  // xxx: fallback?
  invariant(toSetMapPool, "Expected toSetMapPool to be defined");

  const [maps, setMaps] = React.useState(() =>
    generateTournamentRoundMaplist({
      mapCounts: bracket.defaultRoundBestOfs,
      pool: toSetMapPool,
      rounds: bracket.data.round,
      type: bracket.type,
    }),
  );

  const rounds = () => {
    if (bracket.type === "round_robin") {
      return Array.from(maps.keys()).map((roundId, i) => {
        return {
          id: roundId,
          name: `Round ${i + 1}`,
        };
      });
    }

    // xxx: SE & DE
    return [];
  };

  return (
    <Dialog isOpen={isOpen} close={close} className="w-max">
      <fetcher.Form method="post" className="map-list-dialog__container">
        <input type="hidden" name="bracketIdx" value={bracketIdx} />
        <input
          type="hidden"
          name="maps"
          value={JSON.stringify(
            Array.from(maps.entries()).map(([key, value]) => ({
              roundId: key,
              ...value,
            })),
          )}
        />
        <h2 className="text-lg text-center">{bracket.name}</h2>
        <Button
          size="tiny"
          icon={<RefreshArrowsIcon />}
          variant="outlined"
          className="mx-auto"
          onClick={() =>
            setMaps(
              generateTournamentRoundMaplist({
                mapCounts: bracket.defaultRoundBestOfs,
                pool: toSetMapPool,
                rounds: bracket.data.round,
                type: bracket.type,
              }),
            )
          }
        >
          Reroll all maps
        </Button>
        <div className="stack horizontal md flex-wrap">
          {rounds().map((round) => {
            const roundMaps = maps.get(round.id);
            invariant(roundMaps, "Expected maps to be defined");

            return (
              <RoundMapList
                key={round.id}
                name={round.name}
                maps={roundMaps}
                onRoundMapListChange={(newRoundMaps) => {
                  const newMaps = new Map(maps);
                  newMaps.set(round.id, newRoundMaps);

                  setMaps(newMaps);
                }}
              />
            );
          })}
        </div>
        <SubmitButton
          variant="outlined"
          size="tiny"
          testId="finalize-bracket-button"
          _action="START_BRACKET"
          className="mx-auto"
        >
          {t("tournament:bracket.finalize.action")}
        </SubmitButton>
      </fetcher.Form>
    </Dialog>
  );
}

const serializedMapMode = (
  map: NonNullable<TournamentRoundMaps["list"]>[number],
) => `${map.mode}-${map.stageId}`;

function RoundMapList({
  name,
  maps,
  onRoundMapListChange,
}: {
  name: string;
  maps: TournamentRoundMaps;
  onRoundMapListChange: (maps: TournamentRoundMaps) => void;
}) {
  const [editing, setEditing] = React.useState(false);

  return (
    <div>
      <h3 className="stack horizontal sm">
        <div>{name}</div>{" "}
        <Button
          variant={editing ? "minimal-success" : "minimal"}
          onClick={() => setEditing(!editing)}
        >
          {editing ? "Save" : "Edit"}
        </Button>
      </h3>
      {maps.list ? (
        <ol className="pl-0">
          {maps.list.map((map, i) => (
            <MapListRow
              key={serializedMapMode(map)}
              map={map}
              number={i + 1}
              editing={editing}
              onMapChange={(map) => {
                onRoundMapListChange({
                  ...maps,
                  list: maps.list?.map((m, j) => (i === j ? map : m)),
                });
              }}
            />
          ))}
        </ol>
      ) : null}
    </div>
  );
}

function MapListRow({
  map,
  number,
  editing,
  onMapChange,
}: {
  map: NonNullable<TournamentRoundMaps["list"]>[number];
  number: number;
  editing: boolean;
  onMapChange: (map: NonNullable<TournamentRoundMaps["list"]>[number]) => void;
}) {
  const { t } = useTranslation(["game-misc"]);
  const toSetMaps = useTournamentToSetMapPool();

  if (editing) {
    invariant(toSetMaps, "Expected toSetMaps to be defined");

    return (
      <li className="map-list-dialog__map-list-row">
        <div className="stack horizontal items-center xs">
          <span className="text-lg">{number}.</span>
          <select
            defaultValue={serializedMapMode(map)}
            onChange={(e) => {
              const [mode, stageId] = e.target.value.split("-");
              onMapChange({
                mode: mode as ModeShort,
                stageId: Number(stageId) as StageId,
              });
            }}
          >
            {toSetMaps.map((map) => (
              <option
                key={serializedMapMode(map)}
                value={serializedMapMode(map)}
              >
                {t(`game-misc:MODE_SHORT_${map.mode}`)}{" "}
                {t(`game-misc:STAGE_${map.stageId}`)}
              </option>
            ))}
          </select>
        </div>
      </li>
    );
  }

  return (
    <li className="map-list-dialog__map-list-row">
      <div className="stack horizontal items-center xs">
        <span className="text-lg">{number}.</span>
        <ModeImage mode={map.mode} size={24} />
        <StageImage stageId={map.stageId} height={24} className="rounded-sm" />
        {t(`game-misc:STAGE_${map.stageId}`)}
      </div>
    </li>
  );
}
