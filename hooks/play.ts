import { GetAllLadderRegisteredTeamsData } from "prisma/queries/getAllLadderRegisteredTeams";
import useSWR from "swr";

export const useLadderTeams = () =>
  useSWR<GetAllLadderRegisteredTeamsData>("/api/play/teams");
