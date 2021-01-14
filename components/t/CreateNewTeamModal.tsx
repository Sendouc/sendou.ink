import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { sendData } from "lib/postData";
import { useState } from "react";

const CreateNewTeamModal = () => {
  const toast = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [name, setName] = useState("");

  const getError = () => {
    if (name.length < 2 || name.length > 32) {
      return t`Team name needs to between 2 and 32 characters long.`;
    }
    return "";
  };

  const onClick = async () => {
    setButtonClicked(true);
    setSending(true);

    const success = await sendData("POST", "/api/teams", { name });
    setSending(false);
    if (!success) return;

    setIsOpen(false);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
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
