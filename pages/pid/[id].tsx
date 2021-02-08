import { Box } from "@chakra-ui/react";
import MyLink from "components/common/MyLink";
import { GetStaticPaths, GetStaticProps } from "next";
import {
  getAllPlayersByPID,
  GetAllPlayersByPIDData,
} from "prisma/queries/getAllPlayersByPID";

interface Props {
  players: GetAllPlayersByPIDData;
}

const PIDPage: React.FC<Props> = ({ players }) => {
  return (
    <>
      {players.map(({ switchAccountId }) => (
        <Box key={switchAccountId} my={4}>
          <MyLink
            href={`/player/${switchAccountId}`}
          >{`https://sendou.ink/player/${switchAccountId}`}</MyLink>
        </Box>
      ))}
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: "blocking" };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const players = await getAllPlayersByPID(params!.id as string);

  if (players.length === 0) return { notFound: true };
  if (players.length === 1)
    return {
      redirect: {
        destination: `/player/${players[0].switchAccountId}`,
        permanent: true,
      },
    };

  return { props: { players } };
};

export default PIDPage;
