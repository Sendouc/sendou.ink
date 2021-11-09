import { useTournamentByIdentifierQuery } from "generated/graphql";
import { useRouter } from "next/dist/client/router";

export function useTournamentData() {
  const router = useRouter();
  const { tournament } = router.query;
  // TODO: as
  const [result] = useTournamentByIdentifierQuery({
    variables: { identifier: tournament as string },
  });

  return result;
}
