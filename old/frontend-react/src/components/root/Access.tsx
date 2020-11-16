import { Box, Button } from "@chakra-ui/react";
import { RouteComponentProps } from "@reach/router";
import React from "react";
import { DiscordIcon } from "../../assets/icons";
import Alert from "../elements/Alert";

const Access: React.FC<RouteComponentProps> = () => {
  return (
    <>
      <Alert status="info">
        This part of sendou.ink is restricted. Please log in to confirm access.
      </Alert>
      <Box mt="1em">
        <a href="/auth/discord">
          <Button leftIcon={<DiscordIcon />}>Log in via Discord</Button>
        </a>
      </Box>
    </>
  );
};

export default Access;
