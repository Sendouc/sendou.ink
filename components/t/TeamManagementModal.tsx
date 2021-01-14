import {
  Box,
  Button,
  Grid,
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
import { useState } from "react";
import { FiTrash, FiUsers } from "react-icons/fi";
import { mutate } from "swr";

interface Props {
  roster: NonNullable<GetTeamData>["roster"];
  teamId: number;
}

const TeamManagementModal: React.FC<Props> = ({ roster, teamId }) => {
  const router = useRouter();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [sending, setSending] = useState(false);

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

    mutate(`/api/teams/${teamId}`);

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

    mutate(`/api/teams/${teamId}`);

    toast(getToastOptions(t`Switched owners`, "success"));

    setIsOpen(false);
  };

  return (
    <>
      <Button leftIcon={<FiUsers />} onClick={() => setIsOpen(true)}>
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
                >
                  <Trans>Delete team</Trans>
                </Button>
                <Grid
                  templateColumns="repeat(4, 1fr)"
                  gridRowGap={4}
                  gridColumnGap={2}
                  placeItems="center"
                >
                  {roster.map((user) => (
                    <>
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
                      >
                        <Trans>Make owner</Trans>
                      </Button>
                    </>
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
