import type { GetTournamentByOrganizationAndName } from "@sendou-ink/api";
import { useRouter } from "next/dist/client/router";
import { useMySWR } from "hooks/useMySWR";

export function useTournamentData() {
  const router = useRouter();
  const { organization, tournament } = router.query;
  const result = useMySWR<GetTournamentByOrganizationAndName>(
    typeof organization === "string" && typeof tournament === "string"
      ? `/tournaments/${organization}/${tournament}`
      : null
  );

  return result;
}
