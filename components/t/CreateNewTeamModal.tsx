import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { useRouter } from "next/router";
import { useState } from "react";
import { makeNameUrlFriendly } from "utils/makeNameUrlFriendly";
import { sendData } from "utils/postData";

const CreateNewTeamModal = () => {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [name, setName] = useState("");

  const getError = () => {
    if (name.length < 2 || name.length > 32) {
      return t`Team name needs to be between 2 and 32 characters long.`;
    }

    if (/[^a-z0-9 ]/i.test(name) || name === "join") {
      return t`Team name can only contain letters and numbers.`;
    }

    return "";
  };

  const onClick = async () => {
    setButtonClicked(true);
    if (getError()) return;
    setSending(true);

    const success = await sendData("POST", "/api/teams", { name });

    if (!success) return setSending(false);

    router.push(`/t/${makeNameUrlFriendly(name)}`);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} mb={6} size="sm">
        <Trans>New team</Trans>
      </Button>
      {isOpen && (
        <Modal isOpen onClose={() => setIsOpen(false)} size="xl">
          <ModalOverlay>
            <ModalContent>
              <ModalHeader>
                <Trans>Creating a new team</Trans>
              </ModalHeader>
              <ModalCloseButton borderRadius="50%" />
              <ModalBody pb={6}>
                <FormControl isInvalid={!!getError() && buttonClicked}>
                  <FormLabel htmlFor="teamName">
                    <Trans>Team name</Trans>
                  </FormLabel>
                  <Input
                    name="teamName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <FormHelperText>
                    <Trans>
                      Name can't be changed after making the team so choose
                      wisely.
                    </Trans>
                  </FormHelperText>
                  <FormErrorMessage>{getError()}</FormErrorMessage>
                </FormControl>
              </ModalBody>
              <ModalFooter>
                <Button
                  mr={3}
                  type="submit"
                  onClick={onClick}
                  isLoading={sending}
                >
                  <Trans>Create</Trans>
                </Button>
              </ModalFooter>
            </ModalContent>
          </ModalOverlay>
        </Modal>
      )}
    </>
  );
};

export default CreateNewTeamModal;
