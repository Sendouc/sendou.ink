import { Box } from "@chakra-ui/react";
import { GetStaticPaths, GetStaticProps } from "next";
import { getTeam, GetTeamData } from "prisma/queries/getTeam";

interface Props {
  team: GetTeamData;
}

const TeamPage: React.FC<Props> = (props) => {
  const team = props.team!;
  console.log({ team });
  return <Box>{team.name}</Box>;
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
