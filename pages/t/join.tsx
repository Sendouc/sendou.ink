import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { sendData } from "utils/postData";

const statusMessage = {
  LOADING: t`Please wait...`,
  ERROR: t`There is an error that needs to be fixed before you can join the team.`,
  REDIRECTING: t`Joined the team. Redirecting.`,
} as const;

const JoinTeamPage = ({}) => {
  const { i18n } = useLingui();
  const router = useRouter();
  const [joiningStatus, setJoiningStatus] = useState<
    "LOADING" | "ERROR" | "REDIRECTING"
  >("LOADING");

  useEffect(() => {
    const joinTeam = async () => {
      const { code, name } = router.query;
      if (typeof code !== "string" || typeof name !== "string") {
        router.push("/404");
      }

      const success = await sendData("POST", "/api/teams/join", { code, name });
      if (!success) {
        return setJoiningStatus("ERROR");
      }

      setJoiningStatus("REDIRECTING");
      router.push(`/t/${name}`);
    };

    joinTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{i18n._(statusMessage[joiningStatus])}</>;
};

export default JoinTeamPage;
