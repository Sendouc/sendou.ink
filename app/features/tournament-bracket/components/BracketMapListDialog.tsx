import * as React from "react";

import { Dialog } from "~/components/Dialog";
import { generateTournamentRoundMaplist } from "../core/toMapList";
import type { Bracket } from "../core/Bracket";
import {
  useTournament,
  useTournamentToSetMapPool,
} from "~/features/tournament/routes/to.$id";
import invariant from "tiny-invariant";
import type { TournamentRoundMaps } from "~/db/tables";
import { useTranslation } from "react-i18next";
import { ModeImage, StageImage } from "~/components/Image";
import { Button } from "~/components/Button";
import { RefreshArrowsIcon } from "~/components/icons/RefreshArrows";
import type { ModeShort, StageId } from "~/modules/in-game-lists";
import { SubmitButton } from "~/components/SubmitButton";
import { Link, useFetcher } from "@remix-run/react";
import { Label } from "~/components/Label";
import { assertUnreachable } from "~/utils/types";
import clsx from "clsx";
import { nullFilledArray } from "~/utils/arrays";
import { getRounds } from "../core/rounds";
import { calendarEditPage } from "~/utils/urls";

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
  const tournament = useTournament();

  const [maps, setMaps] = React.useState(() =>
    generateTournamentRoundMaplist({
      mapCounts: bracket.defaultRoundBestOfs,
      pool: toSetMapPool,
      rounds: bracket.data.round,
      type: bracket.type,
    }),
  );
  const [mapCounts, setMapCounts] = React.useState(
    () => bracket.defaultRoundBestOfs,
  );
  const [hoveredMap, setHoveredMap] = React.useState<string | null>(null);

  const rounds = React.useMemo(() => {
    if (bracket.type === "round_robin") {
      return Array.from(maps.keys()).map((roundId, i) => {
        return {
          id: roundId,
          name: `Round ${i + 1}`,
        };
      });
    }

    if (bracket.type === "double_elimination") {
      const winners = getRounds({ type: "winners", bracket });
      const losers = getRounds({ type: "losers", bracket });

      return [...winners, ...losers];
    }

    if (bracket.type === "single_elimination") {
      return getRounds({ type: "single", bracket });
    }

    assertUnreachable(bracket.type);
  }, [bracket, maps]);

  const mapCountsWithGlobalCount = (newCount: number) => {
    const newMap = new Map(bracket.defaultRoundBestOfs);

    for (const [groupId, value] of newMap.entries()) {
      const newGroupMap: typeof value = new Map(value);
      for (const [roundNumber, roundValue] of value.entries()) {
        newGroupMap.set(roundNumber, { ...roundValue, count: newCount });
      }

      newMap.set(groupId, newGroupMap);
    }

    return newMap;
  };

  // TODO: could also validate you aren't going up from winners finals to grands etc. (different groups)
  const validateNoDecreasingCount = () => {
    for (const groupCounts of mapCounts.values()) {
      let roundPreviousValue = 0;
      for (const [, roundValue] of Array.from(groupCounts.entries()).sort(
        // sort by round number
        (a, b) => a[0] - b[0],
      )) {
        if (roundPreviousValue > roundValue.count) {
          return false;
        }

        roundPreviousValue = roundValue.count;
      }
    }

    return true;
  };

  const lacksToSetMapPool =
    toSetMapPool.length === 0 && tournament.ctx.mapPickingStyle === "TO";

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
        {lacksToSetMapPool ? (
          <div>
            You need to select map pool in the{" "}
            <Link to={calendarEditPage(tournament.ctx.eventId)}>
              tournament settings
            </Link>{" "}
            before bracket can be started
          </div>
        ) : (
          <>
            <div className="stack horizontal items-center  justify-between">
              <div>
                {bracket.type === "round_robin" ? (
                  <GlobalMapCountInput
                    onSetCount={(newCount) => {
                      const newMapCounts = mapCountsWithGlobalCount(newCount);
                      const newMaps = generateTournamentRoundMaplist({
                        mapCounts: newMapCounts,
                        pool: toSetMapPool,
                        rounds: bracket.data.round,
                        type: bracket.type,
                      });
                      setMaps(newMaps);
                      setMapCounts(newMapCounts);
                    }}
                  />
                ) : null}
              </div>
              {toSetMapPool.length > 0 ? (
                <Button
                  size="tiny"
                  icon={<RefreshArrowsIcon />}
                  variant="outlined"
                  onClick={() =>
                    setMaps(
                      generateTournamentRoundMaplist({
                        mapCounts,
                        pool: toSetMapPool,
                        rounds: bracket.data.round,
                        type: bracket.type,
                      }),
                    )
                  }
                >
                  Reroll all maps
                </Button>
              ) : null}
            </div>
            <div className="stack horizontal md flex-wrap justify-center">
              {rounds.map((round) => {
                const roundMaps = maps.get(round.id);
                invariant(roundMaps, "Expected maps to be defined");

                return (
                  <RoundMapList
                    key={round.id}
                    name={round.name}
                    maps={roundMaps}
                    onHoverMap={setHoveredMap}
                    hoveredMap={hoveredMap}
                    onCountChange={(newCount) => {
                      const newMapCounts = new Map(mapCounts);
                      const bracketRound = bracket.data.round.find(
                        (r) => r.id === round.id,
                      );
                      invariant(bracketRound, "Expected round to be defined");

                      const groupInfo = newMapCounts.get(bracketRound.group_id);
                      invariant(groupInfo, "Expected group info to be defined");
                      const oldMapInfo = newMapCounts
                        .get(bracketRound.group_id)
                        ?.get(bracketRound.number);
                      invariant(oldMapInfo, "Expected map info to be defined");

                      groupInfo.set(bracketRound.number, {
                        ...oldMapInfo,
                        count: newCount,
                      });

                      const newMaps = generateTournamentRoundMaplist({
                        mapCounts: newMapCounts,
                        pool: toSetMapPool,
                        rounds: bracket.data.round,
                        type: bracket.type,
                      });
                      setMaps(newMaps);
                      setMapCounts(newMapCounts);
                    }}
                    onRoundMapListChange={(newRoundMaps) => {
                      const newMaps = new Map(maps);
                      newMaps.set(round.id, newRoundMaps);

                      setMaps(newMaps);
                    }}
                  />
                );
              })}
            </div>
            {validateNoDecreasingCount() ? (
              <SubmitButton
                variant="outlined"
                size="tiny"
                testId="finalize-bracket-button"
                _action="START_BRACKET"
                className="mx-auto"
              >
                {t("tournament:bracket.finalize.action")}
              </SubmitButton>
            ) : (
              <div className="text-warning text-center">
                Invalid selection: tournament progression decreases in map count
              </div>
            )}
          </>
        )}
      </fetcher.Form>
    </Dialog>
  );
}

function GlobalMapCountInput({
  onSetCount,
}: {
  onSetCount: (bestOf: number) => void;
}) {
  return (
    <div>
      <Label htmlFor="count">Count</Label>
      <select id="count" onChange={(e) => onSetCount(Number(e.target.value))}>
        <option>3</option>
        <option>5</option>
        <option>7</option>
      </select>
    </div>
  );
}

const serializedMapMode = (
  map: NonNullable<TournamentRoundMaps["list"]>[number],
) => `${map.mode}-${map.stageId}`;

function RoundMapList({
  name,
  maps,
  onRoundMapListChange,
  onHoverMap,
  onCountChange,
  hoveredMap,
}: {
  name: string;
  maps: TournamentRoundMaps;
  onRoundMapListChange: (maps: TournamentRoundMaps) => void;
  onHoverMap: (map: string | null) => void;
  onCountChange: (count: number) => void;
  hoveredMap: string | null;
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
      {editing ? (
        <div className="stack xs horizontal">
          {[3, 5, 7].map((count) => (
            <div key={count}>
              <Label>Bo{count}</Label>
              <input
                type="radio"
                name="count"
                value={count}
                checked={maps.count === count}
                onChange={() => onCountChange(count)}
              />
            </div>
          ))}
        </div>
      ) : null}
      <ol className="pl-0">
        {maps.list
          ? maps.list.map((map, i) => (
              <MapListRow
                key={i}
                map={map}
                number={i + 1}
                editing={editing}
                onHoverMap={onHoverMap}
                hoveredMap={hoveredMap}
                onMapChange={(map) => {
                  onRoundMapListChange({
                    ...maps,
                    list: maps.list?.map((m, j) => (i === j ? map : m)),
                  });
                }}
              />
            ))
          : nullFilledArray(maps.count).map((_, i) => (
              <MysteryRow key={i} number={i + 1} />
            ))}
      </ol>
    </div>
  );
}

function MapListRow({
  map,
  number,
  editing,
  onMapChange,
  onHoverMap,
  hoveredMap,
}: {
  map: NonNullable<TournamentRoundMaps["list"]>[number];
  number: number;
  editing: boolean;
  onMapChange: (map: NonNullable<TournamentRoundMaps["list"]>[number]) => void;
  onHoverMap: (map: string | null) => void;
  hoveredMap: string | null;
}) {
  const { t } = useTranslation(["game-misc"]);
  const toSetMaps = useTournamentToSetMapPool();

  if (editing) {
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
    <li
      className={clsx("map-list-dialog__map-list-row", {
        "text-theme-secondary font-bold": serializedMapMode(map) === hoveredMap,
      })}
      onMouseEnter={() => onHoverMap(serializedMapMode(map))}
    >
      <div className="stack horizontal items-center xs">
        <span className="text-lg">{number}.</span>
        <ModeImage mode={map.mode} size={24} />
        <StageImage stageId={map.stageId} height={24} className="rounded-sm" />
        {t(`game-misc:STAGE_${map.stageId}`)}
      </div>
    </li>
  );
}

function MysteryRow({ number }: { number: number }) {
  return (
    <li className="map-list-dialog__map-list-row">
      <div className="stack horizontal items-center xs text-lighter">
        <span className="text-lg">{number}.</span>
        Team&apos;s pick
      </div>
    </li>
  );
}
