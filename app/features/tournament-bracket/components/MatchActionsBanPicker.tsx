import { useFetcher, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import { useTranslation } from "react-i18next";
import invariant from "tiny-invariant";
import { Divider } from "~/components/Divider";
import { ModeImage, StageImage } from "~/components/Image";
import { SubmitButton } from "~/components/SubmitButton";
import { CheckmarkIcon } from "~/components/icons/Checkmark";
import { CrossIcon } from "~/components/icons/Cross";
import { useUser } from "~/features/auth/core/user";
import {
  useTournament,
  useTournamentToSetMapPool,
} from "~/features/tournament/routes/to.$id";
import {
  type ModeShort,
  type StageId,
  modesShort,
} from "~/modules/in-game-lists";
import { stageImageUrl } from "~/utils/urls";
import type { TournamentDataTeam } from "../core/Tournament.server";
import * as PickBan from "../core/PickBan";
import type { TournamentMatchLoaderData } from "../routes/to.$id.matches.$mid";
import type { TournamentRoundMaps } from "~/db/tables";

export function MatchActionsBanPicker({
  teams,
}: {
  teams: [TournamentDataTeam, TournamentDataTeam];
}) {
  const data = useLoaderData<TournamentMatchLoaderData>();
  const maps = data.match.roundMaps!;
  const [selected, setSelected] = React.useState<{
    mode: ModeShort;
    stageId: StageId;
  }>();

  const pickerTeamId = PickBan.turnOf({
    results: data.results,
    maps,
    teams: [teams[0].id, teams[1].id],
    mapList: data.mapList,
  })!;
  const pickingTeam = teams.find((team) => team.id === pickerTeamId)!;

  return (
    <div>
      <MapPicker
        selected={selected}
        setSelected={setSelected}
        pickerTeamId={pickerTeamId}
      />
      <CounterpickSubmitter
        selected={selected}
        pickingTeam={pickingTeam}
        pickBan={data.match.roundMaps!.pickBan!}
      />
    </div>
  );
}

// xxx: badges for "OUR" "THEIR" "BOTH" ?
function MapPicker({
  selected,
  setSelected,
  pickerTeamId,
}: {
  selected?: { mode: ModeShort; stageId: StageId };
  setSelected: (selected: { mode: ModeShort; stageId: StageId }) => void;
  pickerTeamId: number;
}) {
  const data = useLoaderData<TournamentMatchLoaderData>();
  const toSetMapPool = useTournamentToSetMapPool();
  const mapPool = PickBan.allMaps({
    toSetMapPool,
    maps: data.match.roundMaps,
    mapList: data.mapList,
  });

  const modes = modesShort.filter((mode) =>
    mapPool.some((map) => map.mode === mode),
  );

  const unavailableStages = PickBan.unavailableStages({
    results: data.results,
    maps: data.match.roundMaps,
    mapList: data.mapList,
  });
  const unavailableModes = PickBan.unavailableModes({
    results: data.results,
    pickerTeamId,
    maps: data.match.roundMaps,
  });

  return (
    <div className="stack lg">
      {modes.map((mode) => {
        const stages = mapPool
          .filter((map) => map.mode === mode)
          .sort((a, b) => a.stageId - b.stageId);

        return (
          <div key={mode} className="map-pool-picker stack sm">
            <Divider className="map-pool-picker__divider">
              <ModeImage mode={mode} size={32} />
            </Divider>
            <div className="stack sm horizontal flex-wrap justify-center mt-1">
              {stages.map(({ stageId }) => {
                const number =
                  data.match.roundMaps?.pickBan === "BAN_2"
                    ? (data.mapList ?? [])?.findIndex(
                        (m) => m.stageId === stageId && m.mode === mode,
                      ) + 1
                    : undefined;

                return (
                  <MapButton
                    key={stageId}
                    stageId={stageId}
                    disabled={
                      unavailableStages.has(stageId) ||
                      unavailableModes.has(mode)
                    }
                    selected={
                      selected?.mode === mode && selected.stageId === stageId
                    }
                    onClick={() => setSelected({ mode, stageId })}
                    number={number}
                  />
                );
              })}
            </div>
            {unavailableModes.has(mode) ? (
              <div className="text-error text-xs text-center">
                Can&apos;t pick the same mode team last won on
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function MapButton({
  stageId,
  onClick,
  selected,
  disabled,
  number,
}: {
  stageId: StageId;
  onClick: () => void;
  selected?: boolean;
  disabled?: boolean;
  number?: number;
}) {
  const { t } = useTranslation(["game-misc"]);

  return (
    <div className="stack items-center relative">
      <button
        className={clsx("map-pool-picker__map-button", {
          "map-pool-picker__map-button__greyed-out": selected || disabled,
        })}
        style={{ "--map-image-url": `url("${stageImageUrl(stageId)}.png")` }}
        onClick={onClick}
        type="button"
      />
      {selected ? (
        <CheckmarkIcon
          className="map-pool-picker__map-button__icon"
          onClick={onClick}
        />
      ) : null}
      {disabled ? (
        <CrossIcon className="map-pool-picker__map-button__icon map-pool-picker__map-button__icon__error" />
      ) : null}
      {number ? (
        <span className="map-pool-picker__map-button__number">{number}</span>
      ) : null}
      <div className="map-pool-picker__map-button__label">
        {t(`game-misc:STAGE_${stageId}`)}
      </div>
    </div>
  );
}

function CounterpickSubmitter({
  selected,
  pickingTeam,
  pickBan,
}: {
  selected?: {
    mode: ModeShort;
    stageId: StageId;
  };
  pickingTeam: TournamentDataTeam;
  pickBan: NonNullable<TournamentRoundMaps["pickBan"]>;
}) {
  const fetcher = useFetcher();
  const { t } = useTranslation(["game-misc"]);
  const user = useUser();
  const tournament = useTournament();

  const ownedTeam = tournament.ownedTeamByUser(user);

  const picking =
    tournament.isOrganizer(user) || ownedTeam?.id === pickingTeam.id;

  if (!picking) {
    return (
      <div className="mt-6 text-lighter text-sm text-center">
        Waiting for captain of {pickingTeam.name} to make their selection
      </div>
    );
  }

  if (picking && !selected) {
    return (
      <div className="mt-6 text-lighter text-sm text-center">
        {pickBan === "BAN_2" ? (
          <>Please select your team&apos;s ban above</>
        ) : (
          <>Please select your team&apos;s counterpick above</>
        )}
      </div>
    );
  }

  invariant(selected, "CounterpickSubmitter: selected is undefined");

  return (
    <div className="stack md items-center">
      <div
        className={clsx("mt-6 text-lighter text-sm", {
          "text-warning": pickBan === "BAN_2",
        })}
      >
        {pickBan === "BAN_2" ? <>Ban</> : <>Counterpick</>}:{" "}
        {t(`game-misc:MODE_SHORT_${selected.mode}`)}{" "}
        {t(`game-misc:STAGE_${selected.stageId}`)}
      </div>
      <div className="stack sm horizontal">
        <ModeImage mode={selected.mode} size={32} />{" "}
        <StageImage
          stageId={selected.stageId}
          height={32}
          className="rounded-sm"
        />
      </div>
      <fetcher.Form method="post">
        <input type="hidden" name="stageId" value={selected.stageId} />
        <input type="hidden" name="mode" value={selected.mode} />
        <SubmitButton _action="BAN_PICK">Confirm</SubmitButton>
      </fetcher.Form>
    </div>
  );
}
