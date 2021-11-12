import { useTournamentByIdentifierQuery } from "generated/graphql";
import { useRouter } from "next/dist/client/router";

export function useTournamentData() {
  const router = useRouter();
  const { tournament } = router.query;
  const [result] = useTournamentByIdentifierQuery({
    variables: { identifier: typeof tournament === "string" ? tournament : "" },
    pause: typeof tournament !== "string",
  });

  return result;
}
