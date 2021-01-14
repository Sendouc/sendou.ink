import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import { useState } from "react";
import { FiUsers } from "react-icons/fi";

const TeamManagementModal = ({}) => {
  const [isOpen, setIsOpen] = useState(false);
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
                {/* <FormControl isInvalid={!!getError() && buttonClicked}>
                  <FormLabel htmlFor="teamName">
                    <Trans>Team name</Trans>
                  </FormLabel>
                  <Input
                    name="teamName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <FormErrorMessage>{getError()}</FormErrorMessage>
                </FormControl> */}
              </ModalBody>
            </ModalContent>
          </ModalOverlay>
        </Modal>
      )}
    </>
  );
};

export default TeamManagementModal;
