import { useMutation, useQuery } from "@apollo/client";
import { Box, useToast } from "@chakra-ui/core";
import React, { useState } from "react";
import { END_VOTING } from "../../graphql/mutations/endVoting";
import {
  StartVotingVars,
  START_VOTING,
} from "../../graphql/mutations/startVoting";
import { PlusInfoData, PLUS_INFO } from "../../graphql/queries/plusInfo";
import Error from "../common/Error";
import Loading from "../common/Loading";
import SubHeader from "../common/SubHeader";
import Button from "../elements/Button";
import DatePicker from "../elements/DatePicker";

const VotingManager: React.FC = () => {
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [confirmed, setConfirmed] = useState(false);
  const toast = useToast();
  const { data, error, loading } = useQuery<PlusInfoData>(PLUS_INFO);

  const [startVotingMutation] = useMutation<boolean, StartVotingVars>(
    START_VOTING,
    {
      onCompleted: (data) => {
        setConfirmed(false);
        toast({
          description: `Voting started`,
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
          query: PLUS_INFO,
        },
      ],
    }
  );

  const [endVotingMutation] = useMutation(END_VOTING, {
    onCompleted: (data) => {
      setConfirmed(false);
      toast({
        description: `Voting ended`,
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
        query: PLUS_INFO,
      },
    ],
  });

  if (loading) return <Loading />;
  if (error) return <Error errorMessage={error.message} />;
  if (!data?.plusInfo) return <>No data plusinfo</>;

  return (
    <>
      <SubHeader>Manage Voting</SubHeader>
      {data.plusInfo.voting_ends ? (
        <Box>
          Voting ends{" "}
          <b>
            {new Date(parseInt(data.plusInfo.voting_ends)).toLocaleString()}
          </b>
          <div style={{ marginTop: "1em" }}>
            {!confirmed ? (
              <Button onClick={() => setConfirmed(true)}>End voting</Button>
            ) : (
              <Button onClick={async () => await endVotingMutation()}>
                End voting for real?
              </Button>
            )}
          </div>
        </Box>
      ) : (
        <>
          <DatePicker date={endDate!} setDate={setEndDate} />
          <div style={{ marginTop: "1em" }}>
            {!confirmed ? (
              <Button onClick={() => setConfirmed(true)}>Start voting</Button>
            ) : (
              <Button
                onClick={async () =>
                  await startVotingMutation({
                    variables: { ends: endDate!.getTime().toString() },
                  })
                }
              >
                Start voting for real?
              </Button>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default VotingManager;
