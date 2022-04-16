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
import {
  ActionFunction,
  json,
  LinksFunction,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useMatches,
  useTransition,
} from "@remix-run/react";
import clsx from "clsx";
import clone from "just-clone";
import * as React from "react";
import invariant from "tiny-invariant";
import { z } from "zod";
import { Alert } from "~/components/Alert";
import { Button } from "~/components/Button";
import { Catcher } from "~/components/Catcher";
import { Draggable } from "~/components/Draggable";
import { averageTeamMMRs } from "~/core/mmr/utils";
import { sortTeamsBySeed, tournamentHasStarted } from "~/core/tournament/utils";
import {
  isTournamentAdmin,
  tournamentHasNotStarted,
} from "~/core/tournament/validators";
import { useTimeoutState } from "~/hooks/common";
import * as Skill from "~/models/Skill.server";
import * as Tournament from "~/models/Tournament.server";
import { FindTournamentByNameForUrlI } from "~/services/tournament";
import seedsStylesUrl from "~/styles/tournament-seeds.css";
import {
  parseRequestFormData,
  requireUser,
  safeJSONParse,
  Unpacked,
  validate,
} from "~/utils";
import { tournamentFrontPage } from "~/utils/urls";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: seedsStylesUrl }];
};

const seedsActionSchema = z.object({
  tournamentId: z.string().uuid(),
  seeds: z.preprocess(safeJSONParse, z.array(z.string())),
});

export const action: ActionFunction = async ({ context, request }) => {
  const data = await parseRequestFormData({
    request,
    schema: seedsActionSchema,
  });
  const user = requireUser(context);

  const tournament = await Tournament.findById(data.tournamentId);
  validate(tournament, "Invalid tournament id");
  validate(
    isTournamentAdmin({ userId: user.id, organization: tournament.organizer }),
    "Not tournament admin"
  );
  validate(
    tournamentHasNotStarted(tournament),
    "Can't change seeds after tournament has started"
  );

  await Tournament.updateSeeds({
    tournamentId: data.tournamentId,
    seeds: data.seeds,
  });

  return null;
};

export interface SeedsLoaderData {
  MMRs: Record<string, number>;
  order: string[];
}

export const loader: LoaderFunction = async ({ params, context }) => {
  const user = requireUser(context);

  invariant(typeof params.organization === "string", "!params.organization");
  invariant(typeof params.tournament === "string", "!params.tournament");

  const tournament = await Tournament.findByNameForUrl({
    organizationNameForUrl: params.organization,
    tournamentNameForUrl: params.tournament,
  });
  invariant(tournament, "!tournament");

  if (
    !isTournamentAdmin({
      userId: user.id,
      organization: tournament.organizer,
    }) ||
    tournamentHasStarted(tournament.brackets)
  ) {
    return redirect(
      tournamentFrontPage({
        organization: tournament.organizer.nameForUrl,
        tournament: tournament.nameForUrl,
      })
    );
  }

  const skills = await Skill.findMostRecentByUserIds(
    tournament.teams.flatMap((t) => t.members).map((m) => m.member.id)
  );

  return json<SeedsLoaderData>({
    MMRs: averageTeamMMRs({ skills, teams: tournament.teams }),
    order: tournament.seeds,
  });
};

// TODO: what if returns error? check other APIs too -> add Cypress test
// TODO: handle overflow better
export default function TournamentSeedsPage() {
  const data = useLoaderData<SeedsLoaderData>();
  const [, parentRoute] = useMatches();
  const { id, teams } = parentRoute.data as FindTournamentByNameForUrlI;
  const transition = useTransition();
  const [teamOrder, setTeamOrder] = React.useState(
    clone(teams)
      // probably this sorting should be redundant but
      // just in case we sort it here again
      // (might matter if the order switched after page load e.g.)
      .sort(sortTeamsBySeed(data.order))
      .map((t) => t.id)
  );
  const [activeTeam, setActiveTeam] = React.useState<Unpacked<
    FindTournamentByNameForUrlI["teams"]
  > | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const teamsSorted = teams.sort(
    (a, b) => teamOrder.indexOf(a.id) - teamOrder.indexOf(b.id)
  );

  return (
    <>
      <SeedAlert tournamentId={id} teamOrder={teamOrder} />
      <Button
        className="tournament__seeds__order-button"
        variant="minimal"
        tiny
        type="button"
        onClick={() => {
          setTeamOrder(
            teams
              .sort((a, b) => (data.MMRs[b.id] ?? -1) - data.MMRs[a.id] ?? -1)
              .map((t) => t.id)
          );
        }}
      >
        Order all by SP
      </Button>
      <ul>
        <li className="tournament__seeds__teams-list-row">
          <div className="tournament__seeds__teams-container__header">Seed</div>
          <div className="tournament__seeds__teams-container__header">SP</div>
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
                const oldIndex = teamIds.indexOf(active.id);
                const newIndex = teamIds.indexOf(over.id);

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
                disabled={transition.state !== "idle"}
                liClassName={clsx(
                  "tournament__seeds__teams-list-row",
                  "sortable",
                  {
                    disabled: transition.state !== "idle",
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
    </>
  );
}

function SeedAlert({
  tournamentId,
  teamOrder,
}: {
  tournamentId: string;
  teamOrder: string[];
}) {
  const [teamOrderInDb, setTeamOrderInDb] = React.useState(teamOrder);
  const [showSuccess, setShowSuccess] = useTimeoutState(false);
  const transition = useTransition();

  React.useEffect(() => {
    // TODO: what if error?
    if (transition.state !== "loading") return;

    setTeamOrderInDb(teamOrder);
    setShowSuccess(true, { timeout: 3000 });
  }, [transition.state, setShowSuccess, teamOrder]);

  const teamOrderChanged = teamOrder.some((id, i) => id !== teamOrderInDb[i]);

  return (
    <Form method="post" className="tournament__seeds__form">
      <input type="hidden" name="tournamentId" value={tournamentId} />
      <input type="hidden" name="seeds" value={JSON.stringify(teamOrder)} />
      <Alert
        type={teamOrderChanged ? "warning" : showSuccess ? "success" : "info"}
        className="tournament__seeds__alert"
        rightAction={
          <Button
            className="tournament__seeds__alert__button"
            type="submit"
            loading={transition.state !== "idle"}
            disabled={!teamOrderChanged}
            loadingText="Saving..."
          >
            Save seeds
          </Button>
        }
      >
        {teamOrderChanged ? (
          <>You have unchanged changes to seeding</>
        ) : showSuccess ? (
          <>Seeds saved successfully!</>
        ) : (
          <>Drag teams to adjust their seeding</>
        )}
      </Alert>
    </Form>
  );
}

function RowContents({
  team,
  seed,
}: {
  team: Unpacked<FindTournamentByNameForUrlI["teams"]>;
  seed?: number;
}) {
  const data = useLoaderData<SeedsLoaderData>();

  return (
    <>
      <div>{seed}</div>
      <div>{data.MMRs[team.id]}</div>
      <div className="tournament__seeds__team-name">{team.name}</div>
      {/* TODO: scrollbar overlaps on windows? */}
      <ol className="tournament__seeds__members-list">
        {team.members.map((member) => (
          <li key={member.member.id}>{member.member.discordName}</li>
        ))}
      </ol>
    </>
  );
}

export const CatchBoundary = Catcher;
