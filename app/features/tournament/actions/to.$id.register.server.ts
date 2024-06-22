import { type ActionFunction } from "@remix-run/node";
import { requireUser } from "~/features/auth/core/user.server";
import { MapPool } from "~/features/map-list-generator/core/map-pool";
import * as QRepository from "~/features/sendouq/QRepository.server";
import * as TeamRepository from "~/features/team/TeamRepository.server";
import {
  clearTournamentDataCache,
  tournamentFromDB,
} from "~/features/tournament-bracket/core/Tournament.server";
import * as UserRepository from "~/features/user-page/UserRepository.server";
import { logger } from "~/utils/logger";
import { notFoundIfFalsy, parseFormData, validate } from "~/utils/remix";
import { booleanToInt } from "~/utils/sql";
import { assertUnreachable } from "~/utils/types";
import { checkIn } from "../queries/checkIn.server";
import { deleteTeam } from "../queries/deleteTeam.server";
import deleteTeamMember from "../queries/deleteTeamMember.server";
import { findByIdentifier } from "../queries/findByIdentifier.server";
import { findOwnTournamentTeam } from "../queries/findOwnTournamentTeam.server";
import { joinTeam } from "../queries/joinLeaveTeam.server";
import { upsertCounterpickMaps } from "../queries/upsertCounterpickMaps.server";
import { TOURNAMENT } from "../tournament-constants";
import { registerSchema } from "../tournament-schemas.server";
import {
  isOneModeTournamentOf,
  tournamentIdFromParams,
  validateCounterPickMapPool,
} from "../tournament-utils";
import { inGameNameIfNeeded } from "../tournament-utils.server";
import {
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  unstable_parseMultipartFormData as parseMultipartFormData,
} from "@remix-run/node";
import { s3UploadHandler } from "~/features/img-upload";
import { nanoid } from "nanoid";
import invariant from "~/utils/invariant";
import * as TournamentTeamRepository from "~/features/tournament/TournamentTeamRepository.server";

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUser(request);
  const { avatarFileName, formData } = await uploadAvatarIfExists(request);
  const data = await parseFormData({
    formData,
    schema: registerSchema,
  });

  const tournamentId = tournamentIdFromParams(params);
  const tournament = await tournamentFromDB({ tournamentId, user });
  const event = notFoundIfFalsy(findByIdentifier(tournamentId));

  validate(
    !tournament.hasStarted,
    "Tournament has started, cannot make edits to registration",
  );

  const ownTeam = tournament.ownedTeamByUser(user);
  const ownTeamCheckedIn = Boolean(ownTeam && ownTeam.checkIns.length > 0);

  switch (data._action) {
    case "UPSERT_TEAM": {
      validate(
        !data.teamId ||
          (await TeamRepository.findByUserId(user.id))?.id === data.teamId,
        "Team id does not match the team you are in",
      );

      if (ownTeam) {
        validate(
          tournament.registrationOpen || data.teamName === ownTeam.name,
          "Can't change team name after registration has closed",
        );

        await TournamentTeamRepository.update({
          userId: user.id,
          avatarFileName,
          team: {
            id: ownTeam.id,
            name: data.teamName,
            prefersNotToHost: booleanToInt(data.prefersNotToHost),
            noScreen: booleanToInt(data.noScreen),
            teamId: data.teamId ?? null,
          },
        });
      } else {
        validate(!tournament.isInvitational, "Event is invite only");
        validate(
          (await UserRepository.findLeanById(user.id))?.friendCode,
          "No friend code",
        );
        validate(
          !tournament.teamMemberOfByUser(user),
          "You are already in a team that you aren't captain of",
        );
        validate(tournament.registrationOpen, "Registration is closed");

        await TournamentTeamRepository.create({
          ownerInGameName: await inGameNameIfNeeded({
            tournament,
            userId: user.id,
          }),
          team: {
            name: data.teamName,
            noScreen: booleanToInt(data.noScreen),
            prefersNotToHost: booleanToInt(data.prefersNotToHost),
            teamId: data.teamId ?? null,
          },
          userId: user.id,
          tournamentId,
          avatarFileName,
        });
      }
      break;
    }
    case "DELETE_TEAM_MEMBER": {
      validate(ownTeam);
      validate(ownTeam.members.some((member) => member.userId === data.userId));
      validate(data.userId !== user.id);

      const detailedOwnTeam = findOwnTournamentTeam({
        tournamentId,
        userId: user.id,
      });
      // making sure they aren't unfilling one checking in condition i.e. having full roster
      // and then having members kicked without it affecting the checking in status
      validate(
        detailedOwnTeam &&
          (!detailedOwnTeam.checkedInAt ||
            ownTeam.members.length > TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL),
      );

      deleteTeamMember({ tournamentTeamId: ownTeam.id, userId: data.userId });
      break;
    }
    case "LEAVE_TEAM": {
      validate(!ownTeam, "Can't leave a team as the owner");

      const teamMemberOf = tournament.teamMemberOfByUser(user);
      validate(teamMemberOf, "You are not in a team");
      validate(
        teamMemberOf.checkIns.length === 0,
        "You cannot leave after checking in",
      );

      deleteTeamMember({
        tournamentTeamId: teamMemberOf.id,
        userId: user.id,
      });

      break;
    }
    case "UPDATE_MAP_POOL": {
      const mapPool = new MapPool(data.mapPool);
      validate(ownTeam);
      validate(
        validateCounterPickMapPool(
          mapPool,
          isOneModeTournamentOf(event),
          tournament.ctx.tieBreakerMapPool,
        ) === "VALID",
      );

      upsertCounterpickMaps({
        tournamentTeamId: ownTeam.id,
        mapPool: new MapPool(data.mapPool),
      });
      break;
    }
    case "CHECK_IN": {
      logger.info(
        `Checking in (try): owned tournament team id: ${ownTeam?.id} - user id: ${user.id} - tournament id: ${tournamentId}`,
      );

      const teamMemberOf = tournament.teamMemberOfByUser(user);
      validate(teamMemberOf, "You are not in a team");
      validate(
        teamMemberOf.checkIns.length === 0,
        "You have already checked in",
      );

      validate(tournament.regularCheckInIsOpen, "Check in is not open");
      validate(
        tournament.checkInConditionsFulfilledByTeamId(teamMemberOf.id),
        "Check in conditions not fulfilled",
      );

      checkIn(teamMemberOf.id);
      logger.info(
        `Checking in (success): tournament team id: ${teamMemberOf.id} - user id: ${user.id} - tournament id: ${tournamentId}`,
      );
      break;
    }
    case "ADD_PLAYER": {
      validate(
        tournament.ctx.teams.every((team) =>
          team.members.every((member) => member.userId !== data.userId),
        ),
        "User is already in a team",
      );
      validate(ownTeam);
      validate(
        (await QRepository.usersThatTrusted(user.id)).some(
          (trusterPlayer) => trusterPlayer.id === data.userId,
        ),
        "No trust given from this user",
      );
      validate(
        (await UserRepository.findLeanById(user.id))?.friendCode,
        "No friend code",
      );
      validate(tournament.registrationOpen, "Registration is closed");

      joinTeam({
        userId: data.userId,
        newTeamId: ownTeam.id,
        tournamentId,
        inGameName: await inGameNameIfNeeded({
          tournament,
          userId: data.userId,
        }),
      });
      break;
    }
    case "UNREGISTER": {
      validate(ownTeam, "You are not registered to this tournament");
      validate(!ownTeamCheckedIn, "You cannot unregister after checking in");

      deleteTeam(ownTeam.id);
      break;
    }
    case "DELETE_LOGO": {
      validate(ownTeam, "You are not registered to this tournament");

      await TournamentTeamRepository.deleteLogo(ownTeam.id);

      break;
    }
    default: {
      assertUnreachable(data);
    }
  }

  clearTournamentDataCache(tournamentId);

  return null;
};

// xxx: make into util function?
async function uploadAvatarIfExists(request: Request) {
  const uploadHandler = composeUploadHandlers(
    s3UploadHandler(`pickup-logo-${nanoid()}-${Date.now()}`),
    createMemoryUploadHandler(),
  );

  try {
    const formData = await parseMultipartFormData(request, uploadHandler);
    const imgSrc = formData.get("img") as string | null;
    invariant(imgSrc);

    const urlParts = imgSrc.split("/");
    const fileName = urlParts[urlParts.length - 1];
    invariant(fileName);

    return {
      avatarFileName: fileName,
      formData,
    };
  } catch (err) {
    // user did not submit image
    if (err instanceof TypeError) {
      return {
        avatarFileName: undefined,
        formData: await request.formData(),
      };
    }

    throw err;
  }
}
