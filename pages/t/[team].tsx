import { Box, Button, Heading, useToast } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import MyContainer from "components/common/MyContainer";
import TeamManagementModal from "components/t/TeamManagementModal";
import { getEmojiFlag } from "countries-list";
import { getToastOptions } from "lib/getToastOptions";
import { sendData } from "lib/postData";
import useUser from "lib/useUser";
import { GetStaticPaths, GetStaticProps } from "next";
import { getTeam, GetTeamData } from "prisma/queries/getTeam";
import { useState } from "react";
import { FiTrash } from "react-icons/fi";

interface Props {
  team: GetTeamData;
}

const TeamPage: React.FC<Props> = (props) => {
  const [sending, setSending] = useState(false);
  const [user] = useUser();
  const toast = useToast();

  const team = props.team!;

  const leaveTeam = async () => {
    if (!window.confirm(t`Leave the team?`)) {
      return;
    }

    setSending(true);

    const success = await sendData("POST", "/api/teams/leave");
    setSending(false);
    if (!success) return;

    //mutate("/api/freeagents");

    toast(getToastOptions(t`Left the team`, "success"));
  };

  return (
    <MyContainer>
      <Heading fontFamily="'Rubik', sans-serif" textAlign="center">
        {team.name}
      </Heading>
      <Box textAlign="center">
        {team.roster
          .reduce((acc: [string, number][], cur) => {
            if (!cur.profile?.country) return acc;

            const countryTuple = acc.find(
              ([country]) => country === cur.profile?.country
            );
            if (!countryTuple) acc.push([cur.profile.country, 1]);
            else countryTuple[1]++;

            return acc;
          }, [])
          .sort((a, b) => b[1] - a[1])
          .map(([country]) => getEmojiFlag(country))}
      </Box>
      {user?.id === team.captainId && <TeamManagementModal />}
      {user &&
        user.id !== team.captainId &&
        team.roster.some((teamMember) => user.id === teamMember.id) && (
          <Button
            leftIcon={<FiTrash />}
            variant="outline"
            colorScheme="red"
            onClick={leaveTeam}
            isLoading={sending}
          >
            <Trans>Leave team</Trans>
          </Button>
        )}
    </MyContainer>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const team = await getTeam(params!.team as string);

  if (!team) return { notFound: true };

  return {
    props: {
      team,
    },
  };
};

export default TeamPage;
