import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import { useState } from "react";
import RotationSelector from "./RotationSelector";

interface Props {
  onClose: () => void;
}

const AddRecordModal: React.FC<Props> = ({ onClose }) => {
  const [sending, setSending] = useState(false);
  return (
    <Modal isOpen onClose={onClose} size="xl" closeOnOverlayClick={false}>
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>
            <Trans>Adding a new Salmon Run result</Trans>
          </ModalHeader>
          <ModalCloseButton borderRadius="50%" />
          <form /*onSubmit={handleSubmit(onSubmit)}*/>
            <ModalBody pb={6}>
              <RotationSelector />
            </ModalBody>
            <ModalFooter>
              <Button mr={3} /*type="submit"*/ isLoading={sending}>
                <Trans>Save</Trans>
              </Button>
              <Button onClick={onClose} variant="outline">
                <Trans>Cancel</Trans>
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

export default AddRecordModal;
