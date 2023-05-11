import type { LoaderArgs, ActionFunction } from "@remix-run/node";
import {
  useFetcher,
  useLoaderData,
  useOutletContext,
  useSubmit,
} from "@remix-run/react";
import * as React from "react";
import { Button } from "~/components/Button";
import { FormMessage } from "~/components/FormMessage";
import { Toggle } from "~/components/Toggle";
import { useTranslation } from "~/hooks/useTranslation";
import { canAdminTournament } from "~/permissions";
import { notFoundIfFalsy, parseRequestFormData, validate } from "~/utils/remix";
import { discordFullName } from "~/utils/strings";
import { findByIdentifier } from "../queries/findByIdentifier.server";
import { findTeamsByTournamentId } from "../queries/findTeamsByTournamentId.server";
import { updateIsBeforeStart } from "../queries/updateIsBeforeStart.server";
import { requireUserId } from "~/modules/auth/user.server";
import {
  HACKY_resolveCheckInTime,
  tournamentIdFromParams,
  validateCanCheckIn,
} from "../tournament-utils";
import { SubmitButton } from "~/components/SubmitButton";
import { UserCombobox } from "~/components/Combobox";
import { adminActionSchema } from "../tournament-schemas.server";
import { changeTeamOwner } from "../queries/changeTeamOwner.server";
import invariant from "tiny-invariant";
import { assertUnreachable } from "~/utils/types";
import { checkIn } from "../queries/checkIn.server";
import { checkOut } from "../queries/checkOut.server";
import hasTournamentStarted from "../queries/hasTournamentStarted.server";
import type { TournamentToolsLoaderData } from "./to.$id";
import { joinTeam, leaveTeam } from "../queries/joinLeaveTeam.server";
import { TOURNAMENT } from "../tournament-constants";
import { deleteTeam } from "../queries/deleteTeam.server";

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUserId(request);
  const data = await parseRequestFormData({
    request,
    schema: adminActionSchema,
  });

  const eventId = tournamentIdFromParams(params);
  const event = notFoundIfFalsy(findByIdentifier(eventId));
  const teams = findTeamsByTournamentId(event.id);

  validate(canAdminTournament({ user, event }));

  switch (data._action) {
    case "UPDATE_SHOW_MAP_LIST_GENERATOR": {
      updateIsBeforeStart({
        id: event.id,
        isBeforeStart: Number(!data.started),
      });
      break;
    }
    case "CHANGE_TEAM_OWNER": {
      const team = teams.find((t) => t.id === data.teamId);
      validate(team, 400, "Invalid team id");
      const oldCaptain = team.members.find((m) => m.isOwner);
      invariant(oldCaptain, "Team has no captain");
      const newCaptain = team.members.find((m) => m.userId === data.memberId);
      validate(newCaptain, 400, "Invalid member id");

      changeTeamOwner({
        newCaptainId: data.memberId,
        oldCaptainId: oldCaptain.userId,
        tournamentTeamId: data.teamId,
      });

      break;
    }
    case "CHECK_IN": {
      const team = teams.find((t) => t.id === data.teamId);
      validate(team, 400, "Invalid team id");
      validateCanCheckIn({ event, team });

      checkIn(team.id);
      break;
    }
    case "CHECK_OUT": {
      const team = teams.find((t) => t.id === data.teamId);
      validate(team, 400, "Invalid team id");
      validate(!hasTournamentStarted(event.id), 400, "Tournament has started");

      checkOut(team.id);
      break;
    }
    case "REMOVE_MEMBER": {
      const team = teams.find((t) => t.id === data.teamId);
      validate(team, 400, "Invalid team id");
      validate(!team.checkedInAt, 400, "Team is checked in");
      validate(
        !team.members.find((m) => m.userId === data.memberId)?.isOwner,
        400,
        "Cannot remove team owner"
      );

      leaveTeam({
        userId: data.memberId,
        teamId: team.id,
      });
      break;
    }
    case "ADD_MEMBER": {
      const team = teams.find((t) => t.id === data.teamId);
      validate(team, 400, "Invalid team id");
      validate(
        team.members.length < TOURNAMENT.TEAM_MAX_MEMBERS,
        400,
        "Team is full"
      );
      validate(
        !teams.some((t) =>
          t.members.some((m) => m.userId === data["user[value]"])
        ),
        400,
        "User is already on a team"
      );

      joinTeam({
        userId: data["user[value]"],
        newTeamId: team.id,
      });
      break;
    }
    case "DELETE_TEAM": {
      const team = teams.find((t) => t.id === data.teamId);
      validate(team, 400, "Invalid team id");
      validate(!hasTournamentStarted(event.id), 400, "Tournament has started");

      deleteTeam(team.id);
      break;
    }
    default: {
      assertUnreachable(data);
    }
  }

  return null;
};

// xxx: remove loader tbh
export const loader = async ({ params, request }: LoaderArgs) => {
  const user = await requireUserId(request);
  const eventId = tournamentIdFromParams(params);

  const event = notFoundIfFalsy(findByIdentifier(eventId));
  notFoundIfFalsy(canAdminTournament({ user, event }));

  // could also get these from the layout page
  // but getting them again for the most fresh data
  return {
    event,
    teams: findTeamsByTournamentId(event.id),
  };
};

export default function TournamentToolsAdminPage() {
  return (
    <div className="stack md">
      <AdminActions />
      <EnableMapList />
      <DownloadParticipants />
    </div>
  );
}

// xxx: implement when but its just frontend check, more checks needed in backend
// xxx: feature flag to disable both in backend and frontend
type Input = "USER" | "ROSTER_MEMBER";
const actions = [
  {
    type: "CHANGE_TEAM_OWNER",
    inputs: ["ROSTER_MEMBER"] as Input[],
    when: [],
  },
  {
    type: "CHECK_IN",
    inputs: [] as Input[],
    when: ["CHECK_IN_STARTED", "TOURNAMENT_BEFORE_START"],
  },
  {
    type: "CHECK_OUT",
    inputs: [] as Input[],
    when: ["CHECK_IN_STARTED", "TOURNAMENT_BEFORE_START"],
  },
  {
    type: "ADD_MEMBER",
    inputs: ["USER"] as Input[],
    when: [],
  },
  {
    type: "REMOVE_MEMBER",
    inputs: ["ROSTER_MEMBER"] as Input[],
    when: ["TOURNAMENT_BEFORE_START"],
  },
  {
    type: "DELETE_TEAM",
    inputs: [] as Input[],
    when: ["TOURNAMENT_BEFORE_START"],
  },
] as const;

// xxx: confirmation if trying to delete team?
function AdminActions() {
  const fetcher = useFetcher();
  const { t } = useTranslation(["tournament"]);
  const data = useLoaderData<typeof loader>();
  const parentRouteData = useOutletContext<TournamentToolsLoaderData>();
  const [selectedTeamId, setSelectedTeamId] = React.useState(data.teams[0]?.id);
  const [selectedAction, setSelectedAction] = React.useState<
    (typeof actions)[number]
  >(actions[0]);

  const selectedTeam = data.teams.find((team) => team.id === selectedTeamId);

  const actionsToShow = actions.filter((action) => {
    for (const when of action.when) {
      switch (when) {
        case "CHECK_IN_STARTED": {
          if (HACKY_resolveCheckInTime(data.event).getTime() > Date.now()) {
            return false;
          }

          break;
        }
        case "TOURNAMENT_BEFORE_START": {
          if (parentRouteData.hasStarted) {
            return false;
          }
          break;
        }
        default: {
          assertUnreachable(when);
        }
      }
    }

    return true;
  });

  return (
    <fetcher.Form
      method="post"
      className="stack horizontal sm items-end flex-wrap"
    >
      <div>
        <label htmlFor="action">Action</label>
        <select
          id="action"
          name="action"
          value={selectedAction.type}
          onChange={(e) =>
            setSelectedAction(actions.find((a) => a.type === e.target.value)!)
          }
        >
          {actionsToShow.map((action) => (
            <option key={action.type} value={action.type}>
              {t(`tournament:admin.actions.${action.type}`)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="teamId">Team</label>
        <select
          id="teamId"
          name="teamId"
          value={selectedTeamId}
          onChange={(e) => setSelectedTeamId(Number(e.target.value))}
        >
          {data.teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>
      {selectedTeam && selectedAction.inputs.includes("ROSTER_MEMBER") ? (
        <div>
          <label htmlFor="memberId">Member</label>
          <select id="memberId" name="memberId">
            {selectedTeam.members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {discordFullName(member)}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {selectedAction.inputs.includes("USER") ? (
        <div>
          <label htmlFor="user">User</label>
          <UserCombobox inputName="user" id="user" />
        </div>
      ) : null}
      <SubmitButton _action={selectedAction.type} state={fetcher.state}>
        Go
      </SubmitButton>
    </fetcher.Form>
  );
}

function EnableMapList() {
  const { t } = useTranslation(["tournament"]);
  const data = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const [eventStarted, setEventStarted] = React.useState(
    Boolean(!data.event.isBeforeStart)
  );
  function handleToggle(toggled: boolean) {
    setEventStarted(toggled);

    const data = new FormData();
    data.append("_action", "UPDATE_SHOW_MAP_LIST_GENERATOR");
    data.append("started", toggled ? "on" : "off");

    submit(data, { method: "post" });
  }

  return (
    <div>
      <label>{t("tournament:admin.eventStarted")}</label>
      <Toggle checked={eventStarted} setChecked={handleToggle} name="started" />
      <FormMessage type="info">
        {t("tournament:admin.eventStarted.explanation")}
      </FormMessage>
    </div>
  );
}

function DownloadParticipants() {
  const { t } = useTranslation(["tournament"]);
  const data = useLoaderData<typeof loader>();

  function discordListContent() {
    return data.teams
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((team) => {
        const owner = team.members.find((user) => user.isOwner);
        invariant(owner);

        return `${team.name} - ${discordFullName(owner)} - <@${
          owner.discordId
        }>`;
      })
      .join("\n");
  }

  return (
    <div>
      <label>{t("tournament:admin.download")}</label>
      <div className="stack horizontal sm">
        <Button
          size="tiny"
          onClick={() =>
            handleDownload({
              filename: "discord.txt",
              content: discordListContent(),
            })
          }
        >
          {t("tournament:admin.download.discord")}
        </Button>
      </div>
    </div>
  );
}

function handleDownload({
  content,
  filename,
}: {
  content: string;
  filename: string;
}) {
  const element = document.createElement("a");
  const file = new Blob([content], {
    type: "text/plain",
  });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
}
