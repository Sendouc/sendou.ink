import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useToast,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import UserAvatar from "components/common/UserAvatar";
import { getToastOptions } from "lib/getToastOptions";
import { sendData } from "lib/postData";
import { useRouter } from "next/router";
import { GetTeamData } from "prisma/queries/getTeam";
import { Fragment, useEffect, useState } from "react";
import { FiCheck, FiTrash, FiUsers } from "react-icons/fi";
import { mutate } from "swr";

interface Props {
  team: NonNullable<GetTeamData>;
}

const TeamManagementModal: React.FC<Props> = ({ team }) => {
  const router = useRouter();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => {
      setCopied(false);
    }, 750);

    return () => clearTimeout(timer);
  }, [copied]);

  const resetCode = async () => {
    setSending(true);

    const success = await sendData("POST", "/api/teams/code");
    setSending(false);
    if (!success) return;

    mutate(`/api/teams/${team.id}`);

    toast(getToastOptions(t`Invite code reseted`, "success"));
  };

  const deleteTeam = async () => {
    if (!window.confirm(t`Delete the team? DELETING IS PERMANENT.`)) return;

    setSending(true);

    const success = await sendData("DELETE", "/api/teams");
    setSending(false);
    if (!success) return;

    toast(getToastOptions(t`Team deleted`, "success"));

    router.push("/t");
  };

  const kickTeamMember = async (id: number, name: string) => {
    if (!window.confirm(`Kick ${name}?`)) return;

    setSending(true);

    const success = await sendData("POST", "/api/teams/kick", { id });
    setSending(false);
    if (!success) return;

    mutate(`/api/teams/${team.id}`);

    toast(getToastOptions(t`User kicked`, "success"));

    setIsOpen(false);
  };

  const makeOwner = async (id: number, name: string) => {
    if (
      !window.confirm(
        `Transfer the ownership to ${name}? YOU WILL LOSE ACCESS TO FEATURES RELATING TO MANAGING THE TEAM.`
      )
    )
      return;

    setSending(true);

    const success = await sendData("POST", "/api/teams/owner", { id });
    setSending(false);
    if (!success) return;

    mutate(`/api/teams/${team.id}`);

    toast(getToastOptions(t`Switched owners`, "success"));

    setIsOpen(false);
  };

  return (
    <>
      <Button
        leftIcon={<FiUsers />}
        onClick={() => setIsOpen(true)}
        size="sm"
        variant="outline"
      >
        <Trans>Manage team</Trans>
      </Button>
      {isOpen && (
        <Modal isOpen onClose={() => setIsOpen(false)} size="xl">
          <ModalOverlay>
            <ModalContent>
              <ModalHeader>
                <Trans>Managing team</Trans>
              </ModalHeader>
              <ModalCloseButton borderRadius="50%" />
              <ModalBody pb={6}>
                <Button
                  leftIcon={<FiTrash />}
                  variant="outline"
                  colorScheme="red"
                  mb={6}
                  isDisabled={sending}
                  onClick={deleteTeam}
                  size="sm"
                >
                  <Trans>Delete team</Trans>
                </Button>

                <FormControl>
                  <FormLabel htmlFor="code">
                    <Trans>Invite link</Trans>
                  </FormLabel>
                  <Input
                    name="code"
                    value={`https://sendou.ink/t/join?name=${team.nameForUrl}&code=${team.inviteCode}`}
                    readOnly
                  />
                  <Flex justify="space-between">
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `https://sendou.ink/t/join?name=${team.nameForUrl}&code=${team.inviteCode}`
                        );
                        setCopied(true);
                      }}
                      h="1.75rem"
                      size="sm"
                      isDisabled={sending || copied}
                      mb={8}
                      mt={4}
                    >
                      {copied ? <FiCheck /> : <Trans>Copy</Trans>}
                    </Button>
                    <Button
                      onClick={resetCode}
                      h="1.75rem"
                      size="sm"
                      isDisabled={sending || copied}
                      mb={8}
                      mt={4}
                      ml={2}
                      colorScheme="red"
                      variant="outline"
                    >
                      <Trans>Reset</Trans>
                    </Button>
                  </Flex>
                </FormControl>
                <Grid
                  templateColumns="repeat(4, 1fr)"
                  gridRowGap={4}
                  gridColumnGap={2}
                  placeItems="center"
                >
                  {team.roster!.map((user) => (
                    <Fragment key={user.id}>
                      <UserAvatar user={user} />
                      <Box>
                        {user.username}#{user.discriminator}
                      </Box>
                      <Button
                        colorScheme="red"
                        variant="outline"
                        isDisabled={sending}
                        onClick={() =>
                          kickTeamMember(
                            user.id,
                            `${user.username}#${user.discriminator}`
                          )
                        }
                        size="sm"
                      >
                        <Trans>Kick</Trans>
                      </Button>
                      <Button
                        colorScheme="red"
                        variant="outline"
                        isDisabled={sending}
                        onClick={() =>
                          makeOwner(
                            user.id,
                            `${user.username}#${user.discriminator}`
                          )
                        }
                        size="sm"
                      >
                        <Trans>Make owner</Trans>
                      </Button>
                    </Fragment>
                  ))}
                </Grid>
              </ModalBody>
            </ModalContent>
          </ModalOverlay>
        </Modal>
      )}
    </>
  );
};

export default TeamManagementModal;
