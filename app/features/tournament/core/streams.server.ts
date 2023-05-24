import { getStreams } from "~/modules/twitch";
import { participantTwitchUsersByTournamentId } from "../queries/participantTwitchUsersByTournamentId.server";
import { findTeamsByTournamentId } from "../queries/findTeamsByTournamentId.server";

export async function streamsByTournamentId(tournamentId: number) {
  const twitchUsersOfTournament =
    participantTwitchUsersByTournamentId(tournamentId);

  const streams = await getStreams();

  const tournamentStreams = streams.flatMap((stream) => {
    const user = twitchUsersOfTournament.find(
      (u) => u.twitch === stream.twitchUserName
    );

    if (!user) return [];

    return {
      ...stream,
      userId: user.id,
    };
  });

  return tournamentStreams;
}

export async function streamingTournamentTeamIds(tournamentId: number) {
  const streamingUserIds = (await streamsByTournamentId(tournamentId)).map(
    (s) => s.userId
  );
  const teams = findTeamsByTournamentId(tournamentId);

  return teams
    .filter((t) => t.members.some((m) => streamingUserIds.includes(m.userId)))
    .map((t) => t.id);
}
