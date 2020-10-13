import { useMutation, useQuery } from "@apollo/client";
import { Box, Button, Flex, Progress, useToast } from "@chakra-ui/core";
import { Redirect, RouteComponentProps } from "@reach/router";
import React, { useContext, useEffect, useState } from "react";
import { AddVotesVars, ADD_VOTES } from "../../graphql/mutations/addVotes";
import { PlusInfoData, PLUS_INFO } from "../../graphql/queries/plusInfo";
import { USER } from "../../graphql/queries/user";
import {
  UsersForVotingData,
  USERS_FOR_VOTING,
  VotingSuggested
} from "../../graphql/queries/usersForVoting";
import MyThemeContext from "../../themeContext";
import { UserData } from "../../types";
import Error from "../common/Error";
import Loading from "../common/Loading";
import PageHeader from "../common/PageHeader";
import SubHeader from "../common/SubHeader";
import Alert from "../elements/Alert";
import PersonForVoting from "./PersonForVoting";

interface SuggestedArrays {
  sameRegion: VotingSuggested[];
  otherRegion: VotingSuggested[];
}

const VotingPage: React.FC<RouteComponentProps> = () => {
  const { themeColor, grayWithShade, colorMode } = useContext(MyThemeContext);
  const { data, loading, error } = useQuery<UsersForVotingData>(
    USERS_FOR_VOTING
  );
  const { data: plusInfoData } = useQuery<PlusInfoData>(PLUS_INFO);
  const { data: userData } = useQuery<UserData>(USER);

  const [votes, setVotes] = useState<Record<string, number>>({});
  const [oldVotes, setOldVotes] = useState<Record<string, number>>({});
  const [suggestedArrays, setSuggestedArrays] = useState<SuggestedArrays>({
    sameRegion: [],
    otherRegion: [],
  });
  const toast = useToast();

  const [addVotesMutation, { loading: addVotesLoading }] = useMutation<
    boolean,
    AddVotesVars
  >(ADD_VOTES, {
    onCompleted: () => {
      window.scrollTo(0, 0);
      toast({
        description: `Votes submitted`,
        position: "top-right",
        status: "success",
        duration: 10000,
      });
    },
    onError: (error) => {
      toast({
        title: "An error occurred",
        description: error.message,
        position: "top-right",
        status: "error",
        duration: 10000,
      });
    },
    refetchQueries: [
      {
        query: USERS_FOR_VOTING,
      },
      {
        query: PLUS_INFO,
      },
    ],
  });

  const handleSubmit = async () => {
    await addVotesMutation({
      variables: {
        votes: Object.keys(votes).map((key) => ({
          discord_id: key,
          score: (votes as any)[key],
        })),
      },
    });
  };

  const user = userData?.user;

  useEffect(() => {
    if (loading || error || !user) return;

    const sameRegionSuggested: VotingSuggested[] = [];
    const otherRegionSuggested: VotingSuggested[] = [];

    data!.usersForVoting.suggested.forEach((suggested) => {
      if (suggested.plus_region === user.plus!.plus_region) {
        sameRegionSuggested.push(suggested);
      } else {
        otherRegionSuggested.push(suggested);
      }
    });

    setSuggestedArrays({
      sameRegion: sameRegionSuggested,
      otherRegion: otherRegionSuggested,
    });

    if (data!.usersForVoting.votes) {
      const voteObj: Record<string, number> = {};
      const oldVoteObj: Record<string, number> = {};
      data!.usersForVoting.votes.forEach((vote) =>
        vote.stale
          ? (oldVoteObj[vote.discord_id] = vote.score)
          : (voteObj[vote.discord_id] = vote.score)
      );
      setVotes(voteObj);
      setOldVotes(oldVoteObj);
    }
  }, [loading, error, data, user]);

  if (plusInfoData && !plusInfoData.plusInfo) {
    return <Redirect to="/access" />;
  }
  if (
    loading ||
    !user ||
    !plusInfoData?.plusInfo ||
    !plusInfoData.plusInfo.voting_ends
  )
    return <Loading />;
  if (error) return <Error errorMessage={error.message} />;

  const votingEnds = parseInt(plusInfoData.plusInfo.voting_ends);
  const {
    voter_count: votedSoFar,
    eligible_voters: eligibleVoters,
  } = plusInfoData.plusInfo;

  const date = new Date();
  if (votingEnds < date.getTime())
    return (
      <Alert status="info">
        Voting is over. Results will be posted a bit later.
      </Alert>
    );

  const hoursLeft = Math.ceil((votingEnds - date.getTime()) / (1000 * 60 * 60));
  const alreadyVoted = votes.length > 0;

  const missingVotes =
    data!.usersForVoting.users.length +
    data!.usersForVoting.suggested.length -
    Object.keys(votes).length;

  return (
    <>
      <PageHeader title="Voting" />
      <Alert status={alreadyVoted ? "success" : "info"}>{`${
        alreadyVoted
          ? "You have voted! Editing and resubmitting before deadline possible. "
          : ""
      }Voting ends ${new Date(votingEnds).toLocaleString()} (${hoursLeft}
          hours left)`}</Alert>
      <Box mt="1em" textAlign="center" color={grayWithShade}>
        <Progress
          value={(votedSoFar / eligibleVoters) * 100}
          color={themeColor}
          bg={colorMode === "dark" ? "#464b64" : `${themeColor}.100`}
        />
        {votedSoFar}/{eligibleVoters} voted so far
      </Box>
      <Box mt="2em">
        <SubHeader>
          {user.plus!.plus_region === "EU" ? "European" : "American"} players
        </SubHeader>
        {data!.usersForVoting.users.map((userForVoting) => {
          if (userForVoting.plus.plus_region !== user.plus!.plus_region)
            return null;
          return (
            <PersonForVoting
              key={userForVoting.discord_id}
              user={userForVoting}
              votes={votes}
              setVotes={setVotes}
              oldVote={oldVotes[userForVoting.discord_id]}
            />
          );
        })}
      </Box>
      {suggestedArrays.sameRegion.length > 0 && (
        <>
          <SubHeader>
            {user.plus!.plus_region === "EU" ? "European" : "American"} players
            (suggested)
          </SubHeader>
          {suggestedArrays.sameRegion.map((suggestion) => {
            return (
              <PersonForVoting
                key={suggestion.discord_user.discord_id}
                user={suggestion.discord_user}
                suggester={suggestion.suggester_discord_user}
                votes={votes}
                setVotes={setVotes}
                description={suggestion.description}
                oldVote={oldVotes[suggestion.discord_user.discord_id]}
              />
            );
          })}
        </>
      )}
      <SubHeader>
        {user.plus!.plus_region === "NA" ? "European" : "American"} players
      </SubHeader>
      {data!.usersForVoting.users.map((userForVoting) => {
        if (userForVoting.plus.plus_region === user.plus!.plus_region)
          return null;
        return (
          <PersonForVoting
            key={userForVoting.discord_id}
            user={userForVoting}
            votes={votes}
            setVotes={setVotes}
            sameRegion={false}
            oldVote={oldVotes[userForVoting.discord_id]}
          />
        );
      })}
      {suggestedArrays.otherRegion.length > 0 && (
        <>
          <SubHeader>
            {user.plus!.plus_region === "NA" ? "European" : "American"} players
            (suggested)
          </SubHeader>

          {suggestedArrays.otherRegion.map((suggestion) => {
            return (
              <PersonForVoting
                key={suggestion.discord_user.discord_id}
                user={suggestion.discord_user}
                suggester={suggestion.suggester_discord_user}
                votes={votes}
                setVotes={setVotes}
                sameRegion={false}
                description={suggestion.description}
                oldVote={oldVotes[suggestion.discord_user.discord_id]}
              />
            );
          })}
        </>
      )}
      <Flex mt="2em" alignItems="center">
        <Box mr="1em">
          <Button
            disabled={missingVotes > 0}
            onClick={handleSubmit}
            isLoading={addVotesLoading}
          >
            Submit
          </Button>
        </Box>
        {missingVotes > 0 && (
          <>
            You need to vote on {missingVotes} more player
            {missingVotes > 1 ? "s" : ""}
          </>
        )}
      </Flex>
    </>
  );
};

export default VotingPage;
