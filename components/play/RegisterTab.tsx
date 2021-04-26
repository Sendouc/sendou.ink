import { Box, Heading } from "@chakra-ui/layout";
import MyError from "components/common/MyError";
import MySpinner from "components/common/MySpinner";
import { trpc } from "utils/trpc";
import LadderTeam from "./LadderTeam";
import RegisterHeader from "./RegisterHeader";

const RegisterTab = () => {
  const registeredTeamsQuery = trpc.useQuery(["play.allRegisteredTeams"]);
  const nextLadderDayQuery = trpc.useQuery(["play.nextLadderDay"]);

  if (nextLadderDayQuery.isLoading) return <MySpinner />;
  if (nextLadderDayQuery.error)
    return <MyError message={nextLadderDayQuery.error.message} />;

  const nextLadderDay = nextLadderDayQuery.data!;

  return (
    <>
      {!nextLadderDay?.matches.length && (
        <Box fontWeight="bold">
          {nextLadderDay ? (
            <Heading size="md" as="h2">
              Next ladder event takes place at{" "}
              {new Date(nextLadderDay.date).toLocaleString()}
            </Heading>
          ) : (
            <>
              Next ladder date is not confirmed. Follow this page for updates!
            </>
          )}
        </Box>
      )}
      {nextLadderDay && (
        <>
          <RegisterHeader />
          <Box mt={4}>
            <Heading size="sm" as="h3">
              Registered teams
            </Heading>
            {registeredTeamsQuery.data
              ?.sort((a, b) => b.roster.length - a.roster.length)
              .map((team) => (
                <LadderTeam key={team.id} roster={team.roster} my={2} />
              ))}
          </Box>
        </>
      )}
    </>
  );
};

export default RegisterTab;
