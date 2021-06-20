import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { useLadderTeams } from "hooks/play";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { sendData } from "utils/postData";

const statusMessage = {
  LOADING: t`Please wait...`,
  ERROR: t`There is an error that needs to be fixed before you can join the team.`,
  REDIRECTING: t`Joined the team. Redirecting.`,
} as const;

const JoinLadderTeamPage = ({}) => {
  const { i18n } = useLingui();
  const router = useRouter();
  const { mutate } = useLadderTeams();
  const [joiningStatus, setJoiningStatus] = useState<
    "LOADING" | "ERROR" | "REDIRECTING"
  >("LOADING");

  useEffect(() => {
    const joinTeam = async () => {
      const { code } = router.query;
      if (typeof code !== "string" || typeof name !== "string") {
        router.push("/404");
      }

      const success = await sendData("POST", "/api/play/teams/join", {
        code,
      });
      if (!success) {
        return setJoiningStatus("ERROR");
      }

      mutate();

      setJoiningStatus("REDIRECTING");
      router.push(`/play`);
    };

    joinTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{i18n._(statusMessage[joiningStatus])}</>;
};

export default JoinLadderTeamPage;
