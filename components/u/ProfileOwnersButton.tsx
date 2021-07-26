import { Button, HStack } from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import { FiEdit } from "react-icons/fi";
import { IoColorPalette } from "react-icons/io5";
import { RiTShirtLine } from "react-icons/ri";

const ProfileOwnersButtons = ({
  canPostBuilds,
  canEditProfileColors,
  showColorEditorsButton,
  setShowProfileModal,
  setBuildToEdit,
  setShowColorSelectors,
}: {
  canPostBuilds: boolean;
  canEditProfileColors: boolean;
  showColorEditorsButton: boolean;
  setShowProfileModal: (isOpen: boolean) => void;
  setBuildToEdit: (isOpen: boolean) => void;
  setShowColorSelectors: (isOpen: boolean) => void;
}) => {
  return (
    <HStack spacing={4}>
      <Button
        leftIcon={<FiEdit />}
        variant="outline"
        onClick={() => setShowProfileModal(true)}
        size="sm"
      >
        <Trans>Edit profile</Trans>
      </Button>
      {canPostBuilds && (
        <Button
          leftIcon={<RiTShirtLine />}
          variant="outline"
          onClick={() => setBuildToEdit(true)}
          size="sm"
        >
          <Trans>Add build</Trans>
        </Button>
      )}
      {showColorEditorsButton ? (
        <Button
          leftIcon={<IoColorPalette />}
          variant="outline"
          disabled={!canEditProfileColors}
          onClick={() => setShowColorSelectors(true)}
          size="sm"
        >
          Edit profile colors
        </Button>
      ) : null}
    </HStack>
  );
};

export default ProfileOwnersButtons;
