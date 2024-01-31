import type { ActionFunction } from "@remix-run/node";
import { useFetcher, useSubmit } from "@remix-run/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import invariant from "tiny-invariant";
import { Avatar } from "~/components/Avatar";
import { Button, LinkButton } from "~/components/Button";
import { Divider } from "~/components/Divider";
import { FormMessage } from "~/components/FormMessage";
import { FormWithConfirm } from "~/components/FormWithConfirm";
import { Label } from "~/components/Label";
import { Redirect } from "~/components/Redirect";
import { SubmitButton } from "~/components/SubmitButton";
import { Toggle } from "~/components/Toggle";
import { UserSearch } from "~/components/UserSearch";
import { TrashIcon } from "~/components/icons/Trash";
import { useUser } from "~/features/auth/core";
import { requireUserId } from "~/features/auth/core/user.server";
import type { TournamentData } from "~/features/tournament-bracket/core/Tournament.server";
import { tournamentFromDB } from "~/features/tournament-bracket/core/Tournament.server";
import { isAdmin } from "~/permissions";
import { databaseTimestampToDate } from "~/utils/dates";
import { parseRequestFormData, validate } from "~/utils/remix";
import { assertUnreachable } from "~/utils/types";
import {
  calendarEditPage,
  calendarEventPage,
  tournamentPage,
} from "~/utils/urls";
import * as TournamentRepository from "../TournamentRepository.server";
import { changeTeamOwner } from "../queries/changeTeamOwner.server";
import { createTeam } from "../queries/createTeam.server";
import { deleteTeam } from "../queries/deleteTeam.server";
import { joinTeam, leaveTeam } from "../queries/joinLeaveTeam.server";
import { updateShowMapListGenerator } from "../queries/updateShowMapListGenerator.server";
import { adminActionSchema } from "../tournament-schemas.server";
import { tournamentIdFromParams } from "../tournament-utils";
import { useTournament } from "./to.$id";
import { findMapPoolByTeamId } from "~/features/tournament-bracket";

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUserId(request);
  const data = await parseRequestFormData({
    request,
    schema: adminActionSchema,
  });

  const tournamentId = tournamentIdFromParams(params);
  const tournament = await tournamentFromDB({ tournamentId, user });

  const validateIsTournamentAdmin = () =>
    validate(tournament.isAdmin(user), "Unauthorized", 401);
  const validateIsTournamentOrganizer = () =>
    validate(tournament.isOrganizer(user), "Unauthorized", 401);

  switch (data._action) {
    case "ADD_TEAM": {
      validateIsTournamentOrganizer();
      validate(
        tournament.ctx.teams.every((t) => t.name !== data.teamName),
        "Team name taken",
      );
      validate(
        !tournament.teamMemberOfByUser({ id: data.userId }),
        "User already on a team",
      );

      createTeam({
        name: data.teamName,
        tournamentId: tournamentId,
        ownerId: data.userId,
        prefersNotToHost: 0,
      });

      break;
    }
    case "UPDATE_SHOW_MAP_LIST_GENERATOR": {
      validateIsTournamentAdmin();
      updateShowMapListGenerator({
        tournamentId: tournament.ctx.id,
        showMapListGenerator: Number(data.show),
      });
      break;
    }
    case "CHANGE_TEAM_OWNER": {
      validateIsTournamentOrganizer();
      const team = tournament.teamById(data.teamId);
      validate(team, "Invalid team id");
      const oldCaptain = team.members.find((m) => m.isOwner);
      invariant(oldCaptain, "Team has no captain");
      const newCaptain = team.members.find((m) => m.userId === data.memberId);
      validate(newCaptain, "Invalid member id");

      changeTeamOwner({
        newCaptainId: data.memberId,
        oldCaptainId: oldCaptain.userId,
        tournamentTeamId: data.teamId,
      });

      break;
    }
    case "CHECK_IN": {
      validateIsTournamentOrganizer();
      const team = tournament.teamById(data.teamId);
      validate(team, "Invalid team id");
      validate(
        data.bracketIdx !== 0 ||
          tournament.checkInConditionsFulfilled({
            tournamentTeamId: team.id,
            mapPool: findMapPoolByTeamId(team.id),
          }),
        "Can't check-in",
      );

      const bracket = tournament.bracketByIdx(data.bracketIdx);
      invariant(bracket, "Invalid bracket idx");
      validate(bracket.preview, "Bracket has been started");

      await TournamentRepository.checkIn({
        tournamentTeamId: data.teamId,
        // 0 = regular check in
        bracketIdx: data.bracketIdx === 0 ? null : data.bracketIdx,
      });
      break;
    }
    case "CHECK_OUT": {
      validateIsTournamentOrganizer();
      const team = tournament.teamById(data.teamId);
      validate(team, "Invalid team id");
      validate(
        data.bracketIdx !== 0 || !tournament.hasStarted,
        "Tournament has started",
      );

      const bracket = tournament.bracketByIdx(data.bracketIdx);
      invariant(bracket, "Invalid bracket idx");
      validate(bracket.preview, "Bracket has been started");

      await TournamentRepository.checkOut({
        tournamentTeamId: data.teamId,
        // 0 = regular check in
        bracketIdx: data.bracketIdx === 0 ? null : data.bracketIdx,
      });
      break;
    }
    case "REMOVE_MEMBER": {
      validateIsTournamentOrganizer();
      const team = tournament.teamById(data.teamId);
      validate(team, "Invalid team id");
      validate(team.checkIns.length === 0, "Team is checked in");
      validate(
        !team.members.find((m) => m.userId === data.memberId)?.isOwner,

        "Cannot remove team owner",
      );

      leaveTeam({
        userId: data.memberId,
        teamId: team.id,
      });
      break;
    }
    // TODO: could also handle the case of admin trying
    // to add members from a checked in team
    case "ADD_MEMBER": {
      validateIsTournamentOrganizer();
      const team = tournament.teamById(data.teamId);
      validate(team, "Invalid team id");

      const previousTeam = tournament.teamMemberOfByUser({ id: data.userId });

      if (tournament.hasStarted) {
        validate(
          !previousTeam || previousTeam.checkIns.length === 0,
          "User is already on a checked in team",
        );
      } else {
        validate(!previousTeam, "User is already on a team");
      }

      joinTeam({
        userId: data.userId,
        newTeamId: team.id,
        previousTeamId: previousTeam?.id,
        // this team is not checked in so we can simply delete it
        whatToDoWithPreviousTeam: previousTeam ? "DELETE" : undefined,
        tournamentId,
      });
      break;
    }
    case "DELETE_TEAM": {
      validateIsTournamentOrganizer();
      const team = tournament.teamById(data.teamId);
      validate(team, "Invalid team id");
      validate(!tournament.hasStarted, "Tournament has started");

      deleteTeam(team.id);
      break;
    }
    case "ADD_STAFF": {
      validateIsTournamentAdmin();
      await TournamentRepository.addStaff({
        role: data.role,
        tournamentId: tournament.ctx.id,
        userId: data.userId,
      });
      break;
    }
    case "REMOVE_STAFF": {
      validateIsTournamentAdmin();
      await TournamentRepository.removeStaff({
        tournamentId: tournament.ctx.id,
        userId: data.userId,
      });
      break;
    }
    case "UPDATE_CAST_TWITCH_ACCOUNTS": {
      validateIsTournamentOrganizer();
      await TournamentRepository.updateCastTwitchAccounts({
        tournamentId: tournament.ctx.id,
        castTwitchAccounts: data.castTwitchAccounts,
      });
      break;
    }
    default: {
      assertUnreachable(data);
    }
  }

  return null;
};

// xxx: download participants of certain bracket (not checked in probably most relevant)
// TODO: translations
export default function TournamentAdminPage() {
  const { t } = useTranslation(["calendar"]);
  const tournament = useTournament();

  const user = useUser();

  if (!tournament.isOrganizer(user) || tournament.everyBracketOver) {
    return <Redirect to={tournamentPage(tournament.ctx.id)} />;
  }

  return (
    <div className="stack lg">
      {tournament.isAdmin(user) && !tournament.hasStarted ? (
        <div className="stack horizontal items-end">
          <LinkButton
            to={calendarEditPage(tournament.ctx.eventId)}
            size="tiny"
            variant="outlined"
            testId="edit-event-info-button"
          >
            Edit event info
          </LinkButton>
          <FormWithConfirm
            dialogHeading={t("calendar:actions.delete.confirm", {
              name: tournament.ctx.name,
            })}
            action={calendarEventPage(tournament.ctx.eventId)}
            submitButtonTestId="delete-submit-button"
          >
            <Button
              className="ml-auto"
              size="tiny"
              variant="minimal-destructive"
              type="submit"
            >
              {t("calendar:actions.delete")}
            </Button>
          </FormWithConfirm>
        </div>
      ) : null}
      <Divider smallText>Team actions</Divider>
      <TeamActions />
      {tournament.isAdmin(user) ? (
        <>
          <Divider smallText>Staff</Divider>
          <Staff />
        </>
      ) : null}
      <Divider smallText>Cast Twitch Accounts</Divider>
      <CastTwitchAccounts />
      <Divider smallText>Participant list download</Divider>
      <DownloadParticipants />
      {isAdmin(user) ? <EnableMapList /> : null}
    </div>
  );
}

type Input =
  | "TEAM_NAME"
  | "REGISTERED_TEAM"
  | "USER"
  | "ROSTER_MEMBER"
  | "BRACKET";
const actions = [
  {
    type: "ADD_TEAM",
    inputs: ["USER", "TEAM_NAME"] as Input[],
    when: ["TOURNAMENT_BEFORE_START"],
  },
  {
    type: "CHANGE_TEAM_OWNER",
    inputs: ["ROSTER_MEMBER", "REGISTERED_TEAM"] as Input[],
    when: [],
  },
  {
    type: "CHECK_IN",
    inputs: ["REGISTERED_TEAM", "BRACKET"] as Input[],
    when: ["CHECK_IN_STARTED"],
  },
  {
    type: "CHECK_OUT",
    inputs: ["REGISTERED_TEAM", "BRACKET"] as Input[],
    when: ["CHECK_IN_STARTED"],
  },
  {
    type: "ADD_MEMBER",
    inputs: ["USER", "REGISTERED_TEAM"] as Input[],
    when: [],
  },
  {
    type: "REMOVE_MEMBER",
    inputs: ["ROSTER_MEMBER", "REGISTERED_TEAM"] as Input[],
    when: ["TOURNAMENT_BEFORE_START"],
  },
  {
    type: "DELETE_TEAM",
    inputs: ["REGISTERED_TEAM"] as Input[],
    when: ["TOURNAMENT_BEFORE_START"],
  },
] as const;

function TeamActions() {
  const fetcher = useFetcher();
  const { t } = useTranslation(["tournament"]);
  const tournament = useTournament();
  const [selectedTeamId, setSelectedTeamId] = React.useState(
    tournament.ctx.teams[0]?.id,
  );
  const [selectedAction, setSelectedAction] = React.useState<
    (typeof actions)[number]
  >(actions[0]);

  const selectedTeam = tournament.teamById(selectedTeamId);

  const actionsToShow = actions.filter((action) => {
    for (const when of action.when) {
      switch (when) {
        case "CHECK_IN_STARTED": {
          if (!tournament.regularCheckInStartInThePast) {
            return false;
          }

          break;
        }
        case "TOURNAMENT_BEFORE_START": {
          if (tournament.hasStarted) {
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
      {selectedAction.inputs.includes("REGISTERED_TEAM") ? (
        <div>
          <label htmlFor="teamId">Team</label>
          <select
            id="teamId"
            name="teamId"
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(Number(e.target.value))}
          >
            {tournament.ctx.teams
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
          </select>
        </div>
      ) : null}
      {selectedAction.inputs.includes("TEAM_NAME") ? (
        <div>
          <label htmlFor="teamId">Team name</label>
          <input id="teamName" name="teamName" />
        </div>
      ) : null}
      {selectedTeam && selectedAction.inputs.includes("ROSTER_MEMBER") ? (
        <div>
          <label htmlFor="memberId">Member</label>
          <select id="memberId" name="memberId">
            {selectedTeam.members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.discordName}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {selectedAction.inputs.includes("USER") ? (
        <div>
          <label htmlFor="user">User</label>
          <UserSearch inputName="userId" id="user" />
        </div>
      ) : null}
      {selectedAction.inputs.includes("BRACKET") ? (
        <div>
          <label htmlFor="bracket">Bracket</label>
          <select id="bracket" name="bracketIdx">
            {tournament.brackets.map((bracket, bracketIdx) => (
              <option key={bracket.name} value={bracketIdx}>
                {bracket.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <SubmitButton
        _action={selectedAction.type}
        state={fetcher.state}
        variant={
          selectedAction.type === "DELETE_TEAM" ? "destructive" : undefined
        }
      >
        Go
      </SubmitButton>
    </fetcher.Form>
  );
}

function Staff() {
  const tournament = useTournament();

  return (
    <div className="stack lg">
      {/* Key so inputs are cleared after staff is added */}
      <StaffAdder key={tournament.ctx.staff.length} />
      <StaffList />
    </div>
  );
}

function CastTwitchAccounts() {
  const id = React.useId();
  const fetcher = useFetcher();
  const tournament = useTournament();

  return (
    <fetcher.Form method="post" className="stack sm">
      <div className="stack horizontal sm items-end">
        <div>
          <Label htmlFor={id}>Twitch accounts</Label>
          <input
            id={id}
            placeholder="dappleproductions"
            name="castTwitchAccounts"
            defaultValue={tournament.ctx.castTwitchAccounts?.join(",")}
          />
        </div>
        <SubmitButton
          testId="save-cast-twitch-accounts-button"
          state={fetcher.state}
          _action="UPDATE_CAST_TWITCH_ACCOUNTS"
        >
          Save
        </SubmitButton>
      </div>
      <FormMessage type="info">
        Twitch account where the tournament is casted. Player streams are added
        automatically based on their profile data. You can also enter multiple
        accounts, just separate them with a comma e.g.
        &quot;sendouc,leanny&quot;
      </FormMessage>
    </fetcher.Form>
  );
}

function StaffAdder() {
  const fetcher = useFetcher();
  const tournament = useTournament();

  return (
    <fetcher.Form method="post" className="stack sm">
      <div className="stack horizontal sm flex-wrap items-end">
        <div>
          <Label htmlFor="staff-user">New staffer</Label>
          <UserSearch
            inputName="userId"
            id="staff-user"
            userIdsToOmit={
              new Set([
                tournament.ctx.author.id,
                ...tournament.ctx.staff.map((s) => s.id),
              ])
            }
          />
        </div>
        <div>
          <Label htmlFor="staff-role">Role</Label>
          <select name="role" id="staff-role" className="w-max">
            <option value="ORGANIZER">Organizer</option>
            <option value="STREAMER">Streamer</option>
          </select>
        </div>
        <SubmitButton
          state={fetcher.state}
          _action="ADD_STAFF"
          testId="add-staff-button"
        >
          Add
        </SubmitButton>
      </div>
      <FormMessage type="info">
        Organizer has same permissions as you expect adding/removing staff,
        editing calendar event info and deleting the tournament. Streamer can
        only talk in chats and see room password/pool.
      </FormMessage>
    </fetcher.Form>
  );
}

function StaffList() {
  const { t } = useTranslation(["tournament"]);
  const tournament = useTournament();

  return (
    <div className="stack md">
      {tournament.ctx.staff.map((staff) => (
        <div
          key={staff.id}
          className="stack horizontal sm items-center"
          data-testid={`staff-id-${staff.id}`}
        >
          <Avatar size="xs" user={staff} />{" "}
          <div className="mr-4">
            <div>{staff.discordName}</div>
            <div className="text-lighter text-xs text-capitalize">
              {t(`tournament:staff.role.${staff.role}`)}
            </div>
          </div>
          <RemoveStaffButton staff={staff} />
        </div>
      ))}
    </div>
  );
}

function RemoveStaffButton({
  staff,
}: {
  staff: TournamentData["ctx"]["staff"][number];
}) {
  const { t } = useTranslation(["tournament"]);

  return (
    <FormWithConfirm
      dialogHeading={`Remove ${staff.discordName} as ${t(
        `tournament:staff.role.${staff.role}`,
      )}?`}
      fields={[
        ["userId", staff.id],
        ["_action", "REMOVE_STAFF"],
      ]}
      deleteButtonText="Remove"
    >
      <Button
        variant="minimal-destructive"
        size="tiny"
        data-testid="remove-staff-button"
      >
        <TrashIcon className="build__icon" />
      </Button>
    </FormWithConfirm>
  );
}

function EnableMapList() {
  const tournament = useTournament();
  const submit = useSubmit();
  const [eventStarted, setEventStarted] = React.useState(
    Boolean(tournament.ctx.showMapListGenerator),
  );
  function handleToggle(toggled: boolean) {
    setEventStarted(toggled);

    const data = new FormData();
    data.append("_action", "UPDATE_SHOW_MAP_LIST_GENERATOR");
    data.append("show", toggled ? "on" : "off");

    submit(data, { method: "post" });
  }

  return (
    <div>
      <label>Public map list generator tool</label>
      <Toggle checked={eventStarted} setChecked={handleToggle} name="show" />
    </div>
  );
}

function DownloadParticipants() {
  const tournament = useTournament();

  function allParticipantsContent() {
    return tournament.ctx.teams
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((team) => {
        const owner = team.members.find((user) => user.isOwner);
        invariant(owner);

        return `${team.name} - ${owner.discordName} - <@${owner.discordId}>`;
      })
      .join("\n");
  }

  function checkedInParticipantsContent() {
    const header = "Teams ordered by registration time\n---\n";

    return (
      header +
      tournament.ctx.teams
        .slice()
        .sort((a, b) => a.createdAt - b.createdAt)
        .filter((team) => team.checkIns.length > 0)
        .map((team, i) => {
          return `${i + 1}) ${team.name} - ${databaseTimestampToDate(
            team.createdAt,
          ).toISOString()} - ${team.members
            .map((member) => `${member.discordName} - <@${member.discordId}>`)
            .join(" / ")}`;
        })
        .join("\n")
    );
  }

  function notCheckedInParticipantsContent() {
    return tournament.ctx.teams
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter((team) => team.checkIns.length === 0)
      .map((team) => {
        return `${team.name} - ${team.members
          .map((member) => `${member.discordName} - <@${member.discordId}>`)
          .join(" / ")}`;
      })
      .join("\n");
  }

  function simpleListInSeededOrder() {
    return tournament.ctx.teams
      .slice()
      .sort((a, b) => (a.seed ?? Infinity) - (b.seed ?? Infinity))
      .filter((team) => team.checkIns.length > 0)
      .map((team) => team.name)
      .join("\n");
  }

  return (
    <div>
      <div className="stack horizontal sm flex-wrap">
        <Button
          size="tiny"
          onClick={() =>
            handleDownload({
              filename: "all-participants.txt",
              content: allParticipantsContent(),
            })
          }
        >
          All participants
        </Button>
        <Button
          size="tiny"
          onClick={() =>
            handleDownload({
              filename: "checked-in-participants.txt",
              content: checkedInParticipantsContent(),
            })
          }
        >
          Checked in participants
        </Button>
        <Button
          size="tiny"
          onClick={() =>
            handleDownload({
              filename: "not-checked-in-participants.txt",
              content: notCheckedInParticipantsContent(),
            })
          }
        >
          Not checked in participants
        </Button>
        <Button
          size="tiny"
          onClick={() =>
            handleDownload({
              filename: "teams-in-seeded-order.txt",
              content: simpleListInSeededOrder(),
            })
          }
        >
          Simple list in seeded order
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
