import Button from "components/elements/Button";
import Input from "components/elements/Input";
import SubText from "components/common/SubText";
import { useUser } from "hooks/common";
import { useState } from "react";
import { ADMIN_DISCORD_ID } from "utils/constants";
import { sendData } from "utils/postData";
import Heading from "components/elements/Heading";

const AdminPage = () => {
  const [user] = useUser();
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [{ switchAccountId, discordId }, setUpdatePlayerIdForms] = useState({
    switchAccountId: "",
    discordId: "",
  });

  if (!user || user.discordId !== ADMIN_DISCORD_ID) return null;

  return (
    <>
      <Heading>Update player ID</Heading>
      <div className="flex my-4">
        <div className="mr-4">
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
        </div>
        <div>
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
        </div>
      </div>
      <div>{successMsg}</div>
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

    setSuccessMsg("User updated");
  }
};

export default AdminPage;
