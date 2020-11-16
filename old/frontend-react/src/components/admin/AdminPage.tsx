import { useQuery } from "@apollo/client";
import { Box, Button, Flex, useToast } from "@chakra-ui/react";
import { Redirect, RouteComponentProps } from "@reach/router";
import React, { useState } from "react";
import {
    MutationUpdatePlayerIdArgs,
    useUpdatePlayerIdMutation
} from "../../generated/graphql";
import { USER } from "../../graphql/queries/user";
import { UserData } from "../../types";
import Error from "../common/Error";
import Loading from "../common/Loading";
import PageHeader from "../common/PageHeader";
import SubHeader from "../common/SubHeader";
import Input from "../elements/Input";
import VotingManager from "./VotingManager";

const AdminPage: React.FC<RouteComponentProps> = () => {
  const [updatePlayerIdForms, setUpdatePlayerIdForms] = useState<
    Partial<MutationUpdatePlayerIdArgs>
  >({});
  const toast = useToast();
  const { data: userData, error: userError, loading: userLoading } = useQuery<
    UserData
  >(USER);

  const [updatePlayerId] = useUpdatePlayerIdMutation({
    onCompleted: () => {
      toast({
        description: "Player ID updated",
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
  });

  if (userError) return <Error errorMessage={userError.message} />;
  if (userLoading) return <Loading />;
  if (!userData!.user) return <Redirect to="/404" />;
  if (userData!.user.discord_id !== "79237403620945920")
    return <Redirect to="/404" />;

  return (
    <>
      <PageHeader title="Admin" />
      <SubHeader>Update player ID</SubHeader>
      <Flex my="1em">
        <Box mr="1em">
          <Input
            value={updatePlayerIdForms.playerId ?? ""}
            setValue={(value) =>
              setUpdatePlayerIdForms({
                ...updatePlayerIdForms,
                playerId: value,
              })
            }
            label="Player ID"
          />
        </Box>
        <Input
          value={updatePlayerIdForms.discordId ?? ""}
          setValue={(value) =>
            setUpdatePlayerIdForms({ ...updatePlayerIdForms, discordId: value })
          }
          label="Discord ID"
        />
      </Flex>
      <Button
        onClick={() => {
          if (!updatePlayerIdForms.playerId || !updatePlayerIdForms.discordId)
            return;
          updatePlayerId({
            variables: {
              playerId: updatePlayerIdForms.playerId,
              discordId: updatePlayerIdForms.discordId,
            },
          });
        }}
      >
        Submit
      </Button>
      <Box>
        <VotingManager />
      </Box>
    </>
  );
};

export default AdminPage;
