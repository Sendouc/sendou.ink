import {
  Button,
  HStack,
  IconButton,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import MyLink from "components/common/MyLink";
import { FiEdit, FiInfo } from "react-icons/fi";
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
      <Button
        leftIcon={<IoColorPalette />}
        variant="outline"
        disabled={!isColorEditorsButtonClickable}
        onClick={() => setShowColorSelectors(true)}
        size="sm"
      >
        Edit profile colors
      </Button>
      {!isColorEditorsButtonClickable ? (
        <Popover placement="top" trigger="hover">
          <PopoverTrigger>
            <IconButton
              variant="ghost"
              isRound
              aria-label="Show description"
              fontSize="20px"
              icon={<FiInfo />}
              marginLeft="5px !important"
            />
          </PopoverTrigger>
          <PopoverContent
            zIndex={4}
            width="220px"
            backgroundColor={CSSVariables.secondaryBgColor}
          >
            <PopoverBody whiteSpace="pre-wrap">
              Editing profile colors is available for{" "}
              <MyLink href="https://www.patreon.com/sendou" isExternal>
                patrons
              </MyLink>{" "}
              of tier "Supporter" ($5 dollar tier)
            </PopoverBody>
          </PopoverContent>
        </Popover>
      ) : null}
    </HStack>
  );
};

export default ProfileOwnersButtons;
