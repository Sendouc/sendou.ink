import type { ActionFunction, LinksFunction } from "@remix-run/node";
import { Form, useOutletContext } from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Alert } from "~/components/Alert";
import { Button } from "~/components/Button";
import { Details, Summary } from "~/components/DetailsSummary";
import { AlertIcon } from "~/components/icons/Alert";
import { CheckmarkIcon } from "~/components/icons/Checkmark";
import { Image } from "~/components/Image";
import { Main } from "~/components/Main";
import { MapPoolSelector } from "~/components/MapPoolSelector";
import { RequiredHiddenInput } from "~/components/RequiredHiddenInput";
import { TOURNAMENT } from "~/constants";
import { db } from "~/db";
import { requireUser } from "~/modules/auth";
import type { StageId } from "~/modules/in-game-lists";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import { MapPool } from "~/modules/map-pool-serializer";
import mapsStyles from "~/styles/maps.css";
import styles from "~/styles/tournament.css";
import {
  badRequestIfFalsy,
  parseRequestFormData,
  validate,
} from "~/utils/remix";
import { findOwnedTeam } from "~/utils/tournaments";
import { assertUnreachable } from "~/utils/types";
import { modeImageUrl } from "~/utils/urls";
import type { TournamentToolsLoaderData } from "../to.$identifier";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: mapsStyles },
  ];
};

const tournamentToolsActionSchema = z.union([
  z.object({
    _action: z.literal("TEAM_NAME"),
    // xxx: not trimming if for example "Team Olive "
    name: z.string().min(1).max(TOURNAMENT.TEAM_NAME_MAX_LENGTH),
  }),
  z.object({
    _action: z.literal("POOL"),
    pool: z.string(),
  }),
]);

export const action: ActionFunction = async ({ request, params }) => {
  const data = await parseRequestFormData({
    request,
    schema: tournamentToolsActionSchema,
  });
  const user = await requireUser(request);

  const event = badRequestIfFalsy(
    db.tournaments.findByIdentifier(params["identifier"]!)
  );
  const teams = db.tournaments.findTeamsByEventId(event.id);
  const ownTeam = findOwnedTeam({ userId: user.id, teams });

  validate(event.isBeforeStart);

  switch (data._action) {
    case "TEAM_NAME": {
      if (ownTeam) {
        db.tournaments.renameTeam({
          id: ownTeam.id,
          name: data.name,
        });
      } else {
        db.tournaments.addTeam({
          ownerId: user.id,
          name: data.name,
          calendarEventId: event.id,
        });
      }
      break;
    }
    case "POOL": {
      validate(ownTeam);
      const mapPool = new MapPool(data.pool);
      validate(validateCounterPickMapPool(mapPool) === "VALID");

      db.tournaments.upsertCounterpickMaps({
        mapPool,
        tournamentTeamId: ownTeam.id,
      });
      break;
    }
    default: {
      assertUnreachable(data);
    }
  }

  return null;
};

export default function TournamentToolsPage() {
  const data = useOutletContext<TournamentToolsLoaderData>();

  return (
    <Main>
      {data.event.isBeforeStart ? <PrestartControls /> : <>generate map list</>}
    </Main>
  );
}

function PrestartControls() {
  const data = useOutletContext<TournamentToolsLoaderData>();

  // xxx: delete team
  return (
    <Form method="post" className="stack md">
      <TeamNameSection />
      {data.ownTeam && (
        <>
          <MapPoolSection />
          <RosterSection />
          <div className="tournament__action-side-note">
            Note: you can change your map pool and roster as many times as you
            want before the tournament starts.
          </div>
        </>
      )}
    </Form>
  );
}

function TeamNameSection() {
  const data = useOutletContext<TournamentToolsLoaderData>();

  return (
    <section className="tournament__action-section">
      1. Register on{" "}
      <a href={data.event.bracketUrl} target="_blank" rel="noopener noreferrer">
        {data.event.bracketUrl}
      </a>
      <div className="mt-4">
        <label htmlFor="name">Team name you register with</label>
        <input
          id="name"
          name="name"
          maxLength={TOURNAMENT.TEAM_NAME_MAX_LENGTH}
          defaultValue={data.ownTeam?.name}
          required
        />
        <Button
          tiny
          className="mt-4"
          name="_action"
          value="TEAM_NAME"
          type="submit"
        >
          Submit
        </Button>
      </div>
    </section>
  );
}

// xxx: what if no map pool but submitting team name
// xxx: some explanation for tiebreaker maps
function MapPoolSection() {
  const data = useOutletContext<TournamentToolsLoaderData>();
  const [counterpickMapPool, setCounterpickMapPool] = React.useState(
    data.ownTeam?.mapPool ? new MapPool(data.ownTeam.mapPool) : MapPool.EMPTY
  );

  const hasPickedMapPool = (data.ownTeam?.mapPool.length ?? 0) > 0;

  return (
    <section className="tournament__action-section stack md">
      <div>
        2. Map pool
        <div className="tournament__action-side-note">
          You can play without selecting a map pool but then your opponent gets
          to decide what maps get played.
        </div>
      </div>
      <Details className="bg-darker-transparent rounded">
        <Summary>
          <div className="tournament__summary-content">
            Pick your team&apos;s maps{" "}
            {hasPickedMapPool ? (
              <CheckmarkIcon className="fill-success" />
            ) : (
              <AlertIcon className="fill-warning" />
            )}
          </div>
        </Summary>
        <RequiredHiddenInput
          value={counterpickMapPool.serialized}
          name="pool"
          isValid={validateCounterPickMapPool(counterpickMapPool) === "VALID"}
        />
        <MapPoolSelector
          mapPool={counterpickMapPool}
          handleMapPoolChange={setCounterpickMapPool}
          noTitle
          includeFancyControls={false}
          modesToInclude={["SZ", "TC", "RM", "CB"]}
          preselectedMapPool={new MapPool(data.tieBreakerMapPool)}
          info={
            <div className="stack md mt-2">
              <MapPoolCounts mapPool={counterpickMapPool} />
              <MapPoolValidationStatusMessage
                status={validateCounterPickMapPool(counterpickMapPool)}
              />
            </div>
          }
          footer={
            <Button
              type="submit"
              className="mt-4 w-max mx-auto"
              name="_action"
              value="POOL"
              tiny
            >
              Save changes
            </Button>
          }
        />
      </Details>
    </section>
  );
}

type CounterPickValidationStatus =
  | "PICKING"
  | "VALID"
  | "TOO_MUCH_STAGE_REPEAT";

function validateCounterPickMapPool(
  mapPool: MapPool
): CounterPickValidationStatus {
  const stageCounts = new Map<StageId, number>();
  for (const stageId of mapPool.stages) {
    if (!stageCounts.has(stageId)) {
      stageCounts.set(stageId, 0);
    }
    if (stageCounts.get(stageId)! === TOURNAMENT.COUNTERPICK_MAX_STAGE_REPEAT) {
      return "TOO_MUCH_STAGE_REPEAT";
    }

    stageCounts.set(stageId, stageCounts.get(stageId)! + 1);
  }

  if (
    mapPool.parsed.SZ.length !== TOURNAMENT.COUNTERPICK_MAPS_PER_MODE ||
    mapPool.parsed.TC.length !== TOURNAMENT.COUNTERPICK_MAPS_PER_MODE ||
    mapPool.parsed.RM.length !== TOURNAMENT.COUNTERPICK_MAPS_PER_MODE ||
    mapPool.parsed.CB.length !== TOURNAMENT.COUNTERPICK_MAPS_PER_MODE
  ) {
    return "PICKING";
  }

  return "VALID";
}

function MapPoolValidationStatusMessage({
  status,
}: {
  status: CounterPickValidationStatus;
}) {
  const { t } = useTranslation(["common"]);

  if (status !== "TOO_MUCH_STAGE_REPEAT") return null;

  return (
    <div>
      <Alert alertClassName="w-max" variation="WARNING" tiny>
        {t(`common:maps.validation.${status}`, {
          maxStageRepeat: TOURNAMENT.COUNTERPICK_MAX_STAGE_REPEAT,
        })}
      </Alert>
    </div>
  );
}

function MapPoolCounts({ mapPool }: { mapPool: MapPool }) {
  const { t } = useTranslation(["game-misc"]);

  return (
    <div className="tournament__map-pool-counts">
      {rankedModesShort.map((mode) => (
        <Image
          key={mode}
          title={t(`game-misc:MODE_LONG_${mode}`)}
          alt={t(`game-misc:MODE_LONG_${mode}`)}
          path={modeImageUrl(mode)}
          width={24}
          height={24}
        />
      ))}
      {rankedModesShort.map((mode) => {
        const currentLen = mapPool.parsed[mode].length;
        const targetLen = TOURNAMENT.COUNTERPICK_MAPS_PER_MODE;

        return (
          <div
            key={mode}
            className={clsx("tournament__map-pool-count", {
              "text-success": currentLen === targetLen,
              "text-error": currentLen > targetLen,
            })}
          >
            {currentLen}/{targetLen}
          </div>
        );
      })}
    </div>
  );
}

function RosterSection() {
  return (
    <section className="tournament__action-section">
      3. Submit roster
      <div className="tournament__action-side-note">
        Submitting roster is optional but you might be seeded lower if you
        don&apos;t.
        <Button className="mt-4">Enter roster</Button>
      </div>
    </section>
  );
}
