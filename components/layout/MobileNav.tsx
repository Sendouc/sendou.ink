import { CloseButton } from "@chakra-ui/close-button";
import { Flex } from "@chakra-ui/layout";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
} from "@chakra-ui/modal";
import { useMyTheme } from "hooks/common";
import ColorModeSwitcher from "./ColorModeSwitcher";
import LanguageSwitcher from "./LanguageSwitcher";
import NavButtons from "./NavButtons";

const MobileNav = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { bgColor } = useMyTheme();
  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="full">
      <DrawerOverlay>
        <DrawerContent bg={bgColor}>
          <DrawerBody>
            <Flex mb={4} align="center" justifyContent="space-between">
              <Flex>
                <ColorModeSwitcher isMobile />
                <LanguageSwitcher isMobile />
              </Flex>
              <CloseButton onClick={onClose} />
            </Flex>
            <NavButtons onButtonClick={onClose} />
          </DrawerBody>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
};

export default MobileNav;
