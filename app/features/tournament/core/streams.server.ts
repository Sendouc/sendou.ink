import { getStreams } from "~/modules/twitch";
import { participantTwitchUsersByTournamentId } from "../queries/participantTwitchUsersByTournamentId.server";

export async function streamsByTournamentId(tournamentId: number) {
  // prevent error logs in development
  if (
    process.env.NODE_ENV === "development" &&
    !process.env["TWITCH_CLIENT_ID"]
  ) {
    return [];
  }
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
