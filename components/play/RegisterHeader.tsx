import {
  Alert,
  AlertDescription,
  AlertTitle,
  Box,
  Button,
  Input,
  useToast,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { useUser } from "hooks/common";
import { useLadderTeams } from "hooks/play";
import { useEffect, useState } from "react";
import { FiCheck, FiTrash } from "react-icons/fi";
import { getToastOptions } from "utils/objects";
import { sendData } from "utils/postData";

interface Props {}

const RegisterHeader: React.FC<Props> = ({}) => {
  const toast = useToast();
  const [user] = useUser();
  const { data, mutate } = useLadderTeams();

  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => {
      setCopied(false);
    }, 750);

    return () => clearTimeout(timer);
  }, [copied]);

  const createNewTeam = async () => {
    setSending(true);
    const success = await sendData("POST", "/api/play/teams");
    setSending(false);
    if (!success) return;

    mutate();

    toast(getToastOptions(t`Team created`, "success"));
  };

  const deleteTeam = async () => {
    if (!window.confirm(t`Delete registration?`)) return;
    setSending(true);
    const success = await sendData("DELETE", "/api/play/teams");
    setSending(false);
    if (!success) return;

    mutate();

    toast(getToastOptions(t`Registration canceled`, "success"));
  };

  const leaveTeam = async () => {
    if (!window.confirm(t`Leave team?`)) return;
    setSending(true);
    const success = await sendData("POST", "/api/play/teams/leave");
    setSending(false);
    if (!success) return;

    mutate();

    toast(getToastOptions(t`Team left`, "success"));
  };

  if (!user) return null;

  const ownTeam = data?.find((team) =>
    team.roster.some((member) => member.id === user.id)
  );

  const ownTeamFullyRegisted = !!ownTeam && ownTeam.roster.length >= 4;

  return (
    <Box my={6}>
      {ownTeam ? (
        <Alert
          status={ownTeamFullyRegisted ? "success" : "warning"}
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          p={6}
          rounded="lg"
        >
          <AlertTitle mb={1} fontSize="lg">
            {ownTeam.roster.length >= 4 ? (
              <Trans>Team fully registered</Trans>
            ) : (
              <Trans>Add players to complete registration</Trans>
            )}
          </AlertTitle>
          <AlertDescription>
            {ownTeam.inviteCode && ownTeam.roster.length < 4 && (
              <Box mt={2}>
                <Input
                  name="code"
                  value={`https://sendou.ink/play/join?code=${ownTeam.inviteCode}`}
                  readOnly
                />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `https://sendou.ink/play/join?code=${ownTeam.inviteCode}`
                    );
                    setCopied(true);
                  }}
                  h="1.75rem"
                  size="sm"
                  isDisabled={sending || copied}
                  my={4}
                  variant="outline"
                  width={36}
                >
                  {copied ? <FiCheck /> : <Trans>Copy invite link</Trans>}
                </Button>
              </Box>
            )}
            <Box fontWeight="bold" mt={2}>
              {ownTeam.roster
                .map((member) => `${member.username}#${member.discriminator}`)
                .join(", ")}
            </Box>
            <Box mt={4}>
              {ownTeam.ownerId === user.id ? (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<FiTrash />}
                  colorScheme="red"
                  onClick={deleteTeam}
                  isLoading={sending}
                >
                  <Trans>Delete registration</Trans>
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="red"
                  onClick={leaveTeam}
                  isLoading={sending}
                >
                  <Trans>Leave team</Trans>
                </Button>
              )}
            </Box>
          </AlertDescription>
        </Alert>
      ) : (
        <Button onClick={createNewTeam} isLoading={sending}>
          <Trans>Register new team</Trans>
        </Button>
      )}
    </Box>
  );
};

export default RegisterHeader;
