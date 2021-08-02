import { Box, Button, HStack } from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import MyLink from "components/common/MyLink";
import { FiEdit } from "react-icons/fi";
import { IoColorPalette } from "react-icons/io5";
import { RiTShirtLine } from "react-icons/ri";
import { CSSVariables } from "utils/CSSVariables";

const ProfileOwnersButtons = ({
  canPostBuilds,
  isColorEditorsButtonClickable,
  setShowProfileModal,
  setBuildToEdit,
  setShowColorSelectors,
}: {
  canPostBuilds: boolean;
  isColorEditorsButtonClickable: boolean;
  setShowProfileModal: (isOpen: boolean) => void;
  setBuildToEdit: (isOpen: boolean) => void;
  setShowColorSelectors: (isOpen: boolean) => void;
}) => {
  return (
    <>
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
        {isColorEditorsButtonClickable ? (
          <Button
            leftIcon={<IoColorPalette />}
            variant="outline"
            disabled={!isColorEditorsButtonClickable}
            onClick={() => setShowColorSelectors(true)}
            size="sm"
          >
            Edit profile colors
          </Button>
        ) : null}
      </HStack>
      {!isColorEditorsButtonClickable ? (
        <Box mt={4} fontSize="xs" color={CSSVariables.themeGray}>
          Editing profile colors is available for{" "}
          <MyLink href="https://www.patreon.com/sendou" isExternal>
            patrons
          </MyLink>{" "}
          of tier &quot;Supporter&quot; ($5 dollar tier)
        </Box>
      ) : null}
    </>
  );
};

export default ProfileOwnersButtons;
