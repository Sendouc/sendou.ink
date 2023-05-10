import type { LoaderArgs, ActionFunction } from "@remix-run/node";
import { useFetcher, useLoaderData, useSubmit } from "@remix-run/react";
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
import { tournamentIdFromParams } from "../tournament-utils";
import { SubmitButton } from "~/components/SubmitButton";
import { UserCombobox } from "~/components/Combobox";
import { adminActionSchema } from "../tournament-schemas.server";
import { changeTeamOwner } from "../queries/changeTeamOwner.server";
import invariant from "tiny-invariant";

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
    when: ["CHECK_IN_OPEN"],
  },
  {
    type: "CHECK_OUT",
    inputs: [] as Input[],
    when: ["CHECK_IN_OPEN"],
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

function AdminActions() {
  const fetcher = useFetcher();
  const { t } = useTranslation(["tournament"]);
  const data = useLoaderData<typeof loader>();
  const [selectedTeamId, setSelectedTeamId] = React.useState(data.teams[0]?.id);
  const [selectedAction, setSelectedAction] = React.useState<
    (typeof actions)[number]
  >(actions[0]);

  const selectedTeam = data.teams.find((team) => team.id === selectedTeamId);

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
          {actions.map((action) => (
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
          <label>User</label>
          <UserCombobox inputName="user" />
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
