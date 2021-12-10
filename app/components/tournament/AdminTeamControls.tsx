import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import classNames from "classnames";
import * as React from "react";
import { useFetcher, useMatches } from "remix";
import { Alert } from "~/components/Alert";
import { Button } from "~/components/Button";
import { MyForm } from "~/components/MyForm";
import { TOURNAMENT_TEAM_ROSTER_MIN_SIZE } from "~/constants";
import { checkInHasStarted } from "~/core/tournament/utils";
import type { FindTournamentByNameForUrlI } from "~/services/tournament";
import type { Unpacked } from "~/utils";
import { useTimeoutState } from "~/utils/hooks";

// TODO: https://docs.dndkit.com/presets/sortable#drag-overlay
// TODO: user can change seed order while submitting which breaks the UI
export function AdminTeamControls() {
  const [, parentRoute] = useMatches();
  const { id, teams, checkInStartTime } =
    parentRoute.data as FindTournamentByNameForUrlI;
  const [teamOrder, setTeamOrder] = React.useState(teams.map((t) => t.id));
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
      <ul className="tournament__admin__teams-container">
        <li className="tournament__admin__teams-list-row">
          <div className="tournament__admin__teams-container__header">Seed</div>
          <div className="tournament__admin__teams-container__header">Name</div>
          <div className="tournament__admin__teams-container__header">
            {checkInHasStarted(checkInStartTime) ? "" : "Registered at"}
          </div>
          <div className="tournament__admin__teams-container__header">
            Roster size
          </div>
        </li>
        {/* TODO: order by seed */}
        <DndContext
          id="team-seed-sorter"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => {
            const { active, over } = event;

            if (!over) return;
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
              <SortableRow key={team.id} team={team} seed={i + 1} />
            ))}
          </SortableContext>
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
  const fetcher = useFetcher();
  const [teamOrderInDb, setTeamOrderInDb] = React.useState(teamOrder);
  const [showSuccess, setShowSuccess] = useTimeoutState(false);

  React.useEffect(() => {
    // TODO: what if error?
    if (fetcher.state !== "loading") return;

    setTeamOrderInDb(teamOrder);
    setShowSuccess(true, { timeout: 3000 });
  }, [fetcher.state]);

  const teamOrderChanged = teamOrder.some((id, i) => id !== teamOrderInDb[i]);

  return (
    <fetcher.Form
      action={`/api/tournament/${tournamentId}/seeds`}
      method="post"
      className="tournament__admin__form"
    >
      <input type="hidden" name="seeds" value={JSON.stringify(teamOrder)} />
      <Alert
        type={teamOrderChanged ? "warning" : showSuccess ? "success" : "info"}
        className="tournament__admin__alert"
        rightAction={
          <Button
            className={classNames("tournament__admin__alert__button", {
              hidden: !teamOrderChanged,
            })}
            type="submit"
            loadingText="Saving..."
            loading={fetcher.state !== "idle"}
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
    </fetcher.Form>
  );
}

function SortableRow({
  team,
  seed,
}: {
  team: Unpacked<FindTournamentByNameForUrlI["teams"]>;
  seed: number;
}) {
  const [, parentRoute] = useMatches();
  const { checkInStartTime } = parentRoute.data as FindTournamentByNameForUrlI;

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: team.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      className="tournament__admin__teams-list-row sortable"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div>{seed}</div>
      <div>{team.name}</div>
      <div>
        {!checkInHasStarted(checkInStartTime) ? (
          <>
            {new Date(team.createdAt).toLocaleString("en-US", {
              month: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            })}
          </>
        ) : team.checkedInTime ? (
          <CheckOutButton teamId={team.id} />
        ) : team.members.length >= TOURNAMENT_TEAM_ROSTER_MIN_SIZE ? (
          <CheckInButton teamId={team.id} />
        ) : null}
      </div>
      <div
        className={classNames({
          tournament__admin__ok:
            team.members.length >= TOURNAMENT_TEAM_ROSTER_MIN_SIZE,
          tournament__admin__problem:
            team.members.length < TOURNAMENT_TEAM_ROSTER_MIN_SIZE,
        })}
      >
        {team.members.length}
      </div>
    </li>
  );
}

function CheckOutButton({ teamId }: { teamId: string }) {
  const fetcher = useFetcher();
  return (
    <MyForm
      action={`/api/tournamentTeam/${teamId}/check-out`}
      className="tournament__action-section__button-container"
      fetcher={fetcher}
    >
      <Button
        tiny
        variant="minimal-destructive"
        loading={fetcher.state !== "idle"}
        loadingText="Checking out"
        type="submit"
      >
        Check-out
      </Button>
    </MyForm>
  );
}

function CheckInButton({ teamId }: { teamId: string }) {
  const fetcher = useFetcher();
  return (
    <MyForm
      action={`/api/tournamentTeam/${teamId}/check-in`}
      className="tournament__action-section__button-container"
      fetcher={fetcher}
    >
      <Button
        tiny
        variant="minimal"
        loading={fetcher.state !== "idle"}
        loadingText="Checking in"
        type="submit"
      >
        Check-in
      </Button>
    </MyForm>
  );
}
