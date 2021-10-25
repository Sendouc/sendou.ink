import useSWR from "swr";
import type { GetTournamentByOrganizationAndName } from "@sendou-ink/api";
import { useRouter } from "next/dist/client/router";

export function useTournamentData() {
  const router = useRouter();
  const { organization, tournament } = router.query;
  const result = useSWR<GetTournamentByOrganizationAndName>(
    typeof organization === "string" && typeof tournament === "string"
      ? `/tournaments/${organization}/${tournament}`
      : null
  );

  return result;
}
