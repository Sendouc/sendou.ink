import { Alert, AlertIcon } from "@chakra-ui/alert";
import { Button } from "@chakra-ui/button";
import { Box, Flex, Heading, HStack } from "@chakra-ui/layout";
import { Progress } from "@chakra-ui/progress";
import Markdown from "components/common/Markdown";
import SubText from "components/common/SubText";
import UserAvatar from "components/common/UserAvatar";
import { useEffect } from "react";
import { getVotingRange } from "utils/plus";
import { getFullUsername } from "utils/strings";
import usePlusVoting from "../hooks/usePlusVoting";
import { PlusVotingButton } from "./PlusVotingButton";

export default function PlusVotingPage() {
  const {
    isLoading,
    shouldRedirect,
    plusStatus,
    currentUser,
    handleVote,
    progress,
    previousUser,
    goBack,
    submit,
    status,
    hasVoted,
  } = usePlusVoting();

  useEffect(() => {
    //redirect!!
  }, [shouldRedirect]);

  if (isLoading || !plusStatus) return null;

  if (hasVoted)
    return (
      <Alert status="success" variant="subtle">
        <AlertIcon />
        Votes succesfully recorded. Voting ends{" "}
        {getVotingRange().endDate.toLocaleString()}.
      </Alert>
    );

  return (
    <>
      <Progress value={progress} size="xs" colorScheme="pink" mb={6} />
      {previousUser ? (
        <Box textAlign="center" mb={6}>
          <UserAvatar user={previousUser} size="sm" />
          <Box my={2} fontSize="sm">
            {getFullUsername(previousUser)}
          </Box>
          <Button
            borderRadius="50%"
            height={10}
            width={10}
            variant="outline"
            colorScheme={previousUser.score < 0 ? "red" : "theme"}
            onClick={goBack}
          >
            {previousUser.score > 0 ? "+" : ""}
            {previousUser.score}
          </Button>
        </Box>
      ) : (
        <Flex align="center" justify="center" height="6.8rem">
          <Heading fontFamily="'Rubik', sans-serif">
            +{plusStatus.membershipTier} Voting
          </Heading>
        </Flex>
      )}
      {currentUser && (
        <>
          <Box mt={6} textAlign="center">
            <UserAvatar user={currentUser} size="2xl" mx="auto" />
            <Box fontSize="2rem" fontWeight="bold" mt={2}>
              {getFullUsername(currentUser)}
            </Box>
          </Box>
          <HStack justify="center" spacing={4} mt={2}>
            {currentUser.region === plusStatus.region && (
              <PlusVotingButton
                number={-2}
                onClick={() =>
                  handleVote({ userId: currentUser.userId, score: -2 })
                }
              />
            )}
            <PlusVotingButton
              number={-1}
              onClick={() =>
                handleVote({ userId: currentUser.userId, score: -1 })
              }
            />
            <PlusVotingButton
              number={1}
              onClick={() =>
                handleVote({ userId: currentUser.userId, score: 1 })
              }
            />
            {currentUser.region === plusStatus.region && (
              <PlusVotingButton
                number={2}
                onClick={() =>
                  handleVote({ userId: currentUser.userId, score: 2 })
                }
              />
            )}
          </HStack>
          {currentUser.suggestions && (
            <Box mt={5}>
              <SubText>Suggestions</SubText>
              {currentUser.suggestions.map((suggestion) => {
                return (
                  <Box key={suggestion.suggesterUser.id} mt={4} fontSize="sm">
                    "{suggestion.description}" -{" "}
                    {getFullUsername(suggestion.suggesterUser)}
                  </Box>
                );
              })}
            </Box>
          )}
          {currentUser.bio && (
            <Box mt={4}>
              <SubText mb={4}>Bio</SubText>
              <Markdown value={currentUser.bio} smallHeaders />
            </Box>
          )}
        </>
      )}
      {previousUser && !currentUser && (
        <Box onClick={submit} mt={6} textAlign="center">
          {" "}
          <Button isLoading={status === "loading"}>Submit</Button>
        </Box>
      )}
    </>
  );
}
