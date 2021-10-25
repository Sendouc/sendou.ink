import { useRouter } from "next/dist/client/router";
import useSWR from "swr";
import { InfoBanner } from "../../../components/tournament/InfoBanner";

export default function TournamentPage() {
  const router = useRouter();
  const { data, error } = useSWR(
    `/tournaments/${router.query.organization}/${router.query.tournament}`
  );
  return <InfoBanner />;
}
