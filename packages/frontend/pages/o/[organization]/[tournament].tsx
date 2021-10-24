import { useRouter } from "next/dist/client/router";
import useSWR from "swr";

export default function TournamentPage() {
  const router = useRouter();
  const { data, error } = useSWR(
    `/tournaments/${router.query.organization}/${router.query.tournament}`
  );
  console.log("error", error);
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
