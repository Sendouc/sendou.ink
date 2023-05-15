import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { LoaderArgs } from "@remix-run/node";
import { type ActionFunction, redirect } from "@remix-run/node";
import {
  useFetcher,
  useLoaderData,
  useMatches,
  useNavigation,
  useOutletContext,
} from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import invariant from "tiny-invariant";
import { Alert } from "~/components/Alert";
import { Button } from "~/components/Button";
import { Catcher } from "~/components/Catcher";
import { Draggable } from "~/components/Draggable";
import { useTimeoutState } from "~/hooks/useTimeoutState";
import type { TournamentLoaderData, TournamentLoaderTeam } from "./to.$id";
import { Image } from "~/components/Image";
import { navIconUrl, tournamentBracketsPage } from "~/utils/urls";
import { maxXPowers } from "../queries/maxXPowers.server";
import { requireUser } from "~/modules/auth";
import { notFoundIfFalsy, parseRequestFormData, validate } from "~/utils/remix";
import { seedsActionSchema } from "../tournament-schemas.server";
import { updateTeamSeeds } from "../queries/updateTeamSeeds.server";
import { tournamentIdFromParams } from "../tournament-utils";
import hasTournamentStarted from "../queries/hasTournamentStarted.server";
import { canAdminTournament } from "~/permissions";
import { findByIdentifier } from "../queries/findByIdentifier.server";
import { SubmitButton } from "~/components/SubmitButton";
import clone from "just-clone";

export const action: ActionFunction = async ({ request, params }) => {
  const data = await parseRequestFormData({
    request,
    schema: seedsActionSchema,
  });
  const user = await requireUser(request);
  const tournamentId = tournamentIdFromParams(params);
  const tournament = notFoundIfFalsy(findByIdentifier(tournamentId));

  const hasStarted = hasTournamentStarted(tournamentId);

  validate(canAdminTournament({ user, event: tournament }));
  validate(hasStarted, "Tournament has started");

  updateTeamSeeds({ tournamentId, teamIds: data.seeds });

  return null;
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const user = await requireUser(request);
  const tournamentId = tournamentIdFromParams(params);
  const hasStarted = hasTournamentStarted(tournamentId);
  const tournament = notFoundIfFalsy(findByIdentifier(tournamentId));

  if (!canAdminTournament({ user, event: tournament }) || hasStarted) {
    throw redirect(tournamentBracketsPage(tournamentId));
  }

  return {
    xPowers: maxXPowers(),
  };
};

export default function TournamentSeedsPage() {
  const data = useLoaderData<typeof loader>();
  const [, parentRoute] = useMatches();
  const { teams } = parentRoute.data as TournamentLoaderData;
  const navigation = useNavigation();
  const [teamOrder, setTeamOrder] = React.useState(teams.map((t) => t.id));
  const [activeTeam, setActiveTeam] =
    React.useState<TournamentLoaderTeam | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const teamsSorted = teams.sort(
    (a, b) => teamOrder.indexOf(a.id) - teamOrder.indexOf(b.id)
  );

  const plusTierToRank: Record<number, number> = {
    999: 1000,
    3: 2000,
    2: 3000,
    1: 4000,
  } as const;
  const rankTeam = (team: TournamentLoaderTeam) => {
    const plusTiers = team.members.map((m) => m.plusTier ?? 999);
    plusTiers.sort((a, b) => a - b);
    plusTiers.slice(0, 4);

    const xPowers = team.members
      .map((m) => data.xPowers[m.userId])
      .filter(Boolean);
    xPowers.sort((a, b) => b - a);
    xPowers.slice(0, 4);

    return (
      xPowers.reduce((acc, xPower) => acc + xPower / 10, 0) +
      plusTiers.reduce((acc, plusTier) => acc + plusTierToRank[plusTier], 0)
    );
  };

  return (
    <div className="stack lg">
      <SeedAlert teamOrder={teamOrder} />
      <Button
        className="tournament__seeds__order-button"
        variant="minimal"
        size="tiny"
        type="button"
        onClick={() => {
          setTeamOrder(
            clone(teams)
              .sort((a, b) => rankTeam(b) - rankTeam(a))
              .map((t) => t.id)
          );
        }}
      >
        Sort automatically
      </Button>
      <ul>
        <li className="tournament__seeds__teams-list-row">
          <div className="tournament__seeds__teams-container__header">Seed</div>
          <div className="tournament__seeds__teams-container__header">Name</div>
          <div className="tournament__seeds__teams-container__header">
            Players
          </div>
        </li>
        <DndContext
          id="team-seed-sorter"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(event) => {
            const newActiveTeam = teamsSorted.find(
              (t) => t.id === event.active.id
            );
            invariant(newActiveTeam, "newActiveTeam is undefined");
            setActiveTeam(newActiveTeam);
          }}
          onDragEnd={(event) => {
            const { active, over } = event;

            if (!over) return;
            setActiveTeam(null);
            if (active.id !== over.id) {
              setTeamOrder((teamIds) => {
                const oldIndex = teamIds.indexOf(active.id as number);
                const newIndex = teamIds.indexOf(over.id as number);

                return arrayMove(teamIds, oldIndex, newIndex);
              });
            }
          }}
        >
          <SortableContext
            items={teamOrder}
            strategy={verticalListSortingStrategy}
          >
            {teamsSorted.map((team, i) => (
              <Draggable
                key={team.id}
                id={team.id}
                disabled={navigation.state !== "idle"}
                liClassName={clsx(
                  "tournament__seeds__teams-list-row",
                  "sortable",
                  {
                    disabled: navigation.state !== "idle",
                    invisible: activeTeam?.id === team.id,
                  }
                )}
              >
                <RowContents team={team} seed={i + 1} />
              </Draggable>
            ))}
          </SortableContext>

          <DragOverlay>
            {activeTeam && (
              <li className="tournament__seeds__teams-list-row active">
                <RowContents team={activeTeam} />
              </li>
            )}
          </DragOverlay>
        </DndContext>
      </ul>
    </div>
  );
}

function SeedAlert({ teamOrder }: { teamOrder: number[] }) {
  const data = useOutletContext<TournamentLoaderData>();
  const [teamOrderInDb, setTeamOrderInDb] = React.useState(teamOrder);
  const [showSuccess, setShowSuccess] = useTimeoutState(false);
  const fetcher = useFetcher();

  React.useEffect(() => {
    // TODO: what if error?
    if (fetcher.state !== "loading") return;

    setTeamOrderInDb(teamOrder);
    setShowSuccess(true, { timeout: 3000 });
    // TODO: figure out a better way
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.state]);

  const teamOrderChanged = teamOrder.some((id, i) => id !== teamOrderInDb[i]);

  return (
    <fetcher.Form method="post" className="tournament__seeds__form">
      <input type="hidden" name="tournamentId" value={data.event.id} />
      <input type="hidden" name="seeds" value={JSON.stringify(teamOrder)} />
      <Alert
        variation={
          teamOrderChanged ? "WARNING" : showSuccess ? "SUCCESS" : "INFO"
        }
        alertClassName="tournament-bracket__start-bracket-alert"
        textClassName="stack horizontal md items-center"
      >
        {teamOrderChanged ? (
          <>You have unchanged changes to seeding</>
        ) : showSuccess ? (
          <>Seeds saved successfully!</>
        ) : (
          <>Drag teams to adjust their seeding</>
        )}
        {(!showSuccess || teamOrderChanged) && (
          <SubmitButton
            state={fetcher.state}
            disabled={!teamOrderChanged}
            size="tiny"
          >
            Save seeds
          </SubmitButton>
        )}
      </Alert>
    </fetcher.Form>
  );
}

function RowContents({
  team,
  seed,
}: {
  team: TournamentLoaderTeam;
  seed?: number;
}) {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <div>{seed}</div>
      <div className="tournament__seeds__team-name">{team.name}</div>
      <div className="stack horizontal sm">
        {team.members.map((member) => {
          const xPower = data.xPowers[member.userId];
          const lonely =
            (!xPower && member.plusTier) || (!member.plusTier && xPower);

          return (
            <div key={member.userId} className="tournament__seeds__team-member">
              <div className="tournament__seeds__team-member__name">
                {member.discordName}
              </div>
              {member.plusTier ? (
                <div
                  className={clsx("stack horizontal items-center xxs", {
                    "add tournament__seeds__lonely-stat": lonely,
                  })}
                >
                  <Image path={navIconUrl("plus")} alt="" width={16} /> +
                  {member.plusTier}
                </div>
              ) : (
                <div />
              )}
              {xPower ? (
                <div
                  className={clsx("stack horizontal items-center xxs", {
                    "add tournament__seeds__lonely-stat": lonely,
                  })}
                >
                  <Image path={navIconUrl("xsearch")} alt="" width={16} />{" "}
                  {xPower}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
}

export const CatchBoundary = Catcher;
