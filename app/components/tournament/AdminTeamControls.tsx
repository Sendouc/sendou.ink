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

// TODO: https://docs.dndkit.com/presets/sortable#drag-overlay
// TODO: cursor flickers when going down the list
// TODO: grabbing cursor
export function AdminTeamControls() {
  const [, parentRoute] = useMatches();
  const { teams, checkInStartTime } =
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
      <Alert type="info" className="tournament__admin__alert">
        Drag teams to adjust their seeding
      </Alert>
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
      action={`/api/tournament/${teamId}/check-out`}
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
      action={`/api/tournament/${teamId}/check-in`}
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
