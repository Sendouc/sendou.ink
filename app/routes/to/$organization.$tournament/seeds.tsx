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
import clsx from "clsx";
import * as React from "react";
import {
  ActionFunction,
  Form,
  LinksFunction,
  useMatches,
  useTransition,
} from "remix";
import invariant from "tiny-invariant";
import { z } from "zod";
import { Alert } from "~/components/Alert";
import { Button } from "~/components/Button";
import { Catcher } from "~/components/Catcher";
import { Draggable } from "~/components/Draggable";
import { FindTournamentByNameForUrlI } from "~/services/tournament";
import seedsStylesUrl from "~/styles/tournament-seeds.css";
import {
  parseRequestFormData,
  requireUser,
  safeJSONParse,
  Unpacked,
  validate,
} from "~/utils";
import { useTimeoutState } from "~/hooks/common";
import * as Tournament from "~/models/Tournament.server";
import {
  isTournamentAdmin,
  tournamentHasNotStarted,
} from "~/core/tournament/validators";

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

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: seedsStylesUrl }];
};

// TODO: what if returns error? check other APIs too -> add Cypress test
// TODO: error if not admin
export default function SeedsTab() {
  const [, parentRoute] = useMatches();
  const { id, teams } = parentRoute.data as FindTournamentByNameForUrlI;
  const transition = useTransition();
  const [teamOrder, setTeamOrder] = React.useState(teams.map((t) => t.id));
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
            className={clsx("tournament__seeds__alert__button", {
              hidden: !teamOrderChanged,
            })}
            type="submit"
            loading={transition.state !== "idle"}
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
  return (
    <>
      <div>{seed}</div>
      <div className="tournament__seeds__team-name">{team.name}</div>
      {/* TODO: scrollbar overlaps on windows? */}
      <ol
        className="tournament__seeds__members-list"
        // style={{ whiteSpace: "nowrap", overflowX: "auto" }}
      >
        {team.members.map((member) => (
          <li key={member.member.id}>{member.member.discordName}</li>
        ))}
      </ol>
    </>
  );
}

export const CatchBoundary = Catcher;
