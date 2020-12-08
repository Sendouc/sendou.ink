import { Box, Button, Flex, Heading, Input, useToast } from "@chakra-ui/react";
import Breadcrumbs from "components/common/Breadcrumbs";
import SubText from "components/common/SubText";
import { ADMIN_DISCORD_ID } from "lib/constants";
import { getToastOptions } from "lib/getToastOptions";
import { sendData } from "lib/postData";
import useUser from "lib/useUser";
import { useState } from "react";

const AdminPage = () => {
  const toast = useToast();
  const [user] = useUser();
  const [sending, setSending] = useState(false);
  const [{ switchAccountId, discordId }, setUpdatePlayerIdForms] = useState({
    switchAccountId: "",
    discordId: "",
  });

  if (!user || user.discordId !== ADMIN_DISCORD_ID) return null;

  return (
    <>
      <Breadcrumbs pages={[{ name: "Admin" }]} />
      <Heading>Update player ID</Heading>
      <Flex my="1em">
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
