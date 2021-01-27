import { GetAllLadderRegisteredTeamsData } from "prisma/queries/getAllLadderRegisteredTeams";
import useSWR from "swr";

export const useLadderTeams = (skip?: boolean) =>
  useSWR<GetAllLadderRegisteredTeamsData>(skip ? null : "/api/play/teams");
