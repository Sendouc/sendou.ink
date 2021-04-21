import { Box, Button, Flex, Heading, Input, useToast } from "@chakra-ui/react";
import SubText from "components/common/SubText";
import { useUser } from "hooks/common";
import { useState } from "react";
import { ADMIN_DISCORD_ID } from "utils/constants";
import { getToastOptions } from "utils/objects";
import { sendData } from "utils/postData";
import { trpc } from "utils/trpc";

const AdminPage = () => {
  const toast = useToast();
  const [user] = useUser();
  const [sending, setSending] = useState(false);
  const [{ switchAccountId, discordId }, setUpdatePlayerIdForms] = useState({
    switchAccountId: "",
    discordId: "",
  });
  const endVoting = trpc.useMutation("plus.endVoting");

  const handleEndVoting = () => {
    if (!window.confirm("End voting?")) return;

    endVoting.mutate(null);
  };

  if (!user || user.discordId !== ADMIN_DISCORD_ID) return null;

  return (
    <>
      <Heading>Update player ID</Heading>
      <Flex mb="1em">
        <Box mr="1em">
          <SubText>Switch account ID</SubText>
          <Input
            value={switchAccountId}
            onChange={(e) =>
              setUpdatePlayerIdForms({
                discordId,
                switchAccountId: e.target.value,
              })
            }
          />
        </Box>
        <Box>
          <SubText>Discord ID</SubText>
          <Input
            value={discordId}
            onChange={(e) =>
              setUpdatePlayerIdForms({
                switchAccountId,
                discordId: e.target.value,
              })
            }
          />
        </Box>
      </Flex>
      <Button isLoading={sending} onClick={updateUser}>
        Submit
      </Button>
      <Heading my={4}>End voting</Heading>
      <Button
        isLoading={endVoting.status === "loading"}
        onClick={handleEndVoting}
      >
        End
      </Button>
    </>
  );

  async function updateUser() {
    if (!switchAccountId || !discordId) return;

    setSending(true);

    const success = await sendData("PATCH", `/api/users/${discordId}/player`, {
      switchAccountId,
    });
    setSending(false);
    if (!success) return;

    toast(getToastOptions("User updated", "success"));
  }
};

export default AdminPage;
