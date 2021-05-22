import { Button } from "@chakra-ui/button";
import { CloseButton } from "@chakra-ui/close-button";
import { Flex } from "@chakra-ui/layout";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
} from "@chakra-ui/modal";
import MyLink from "components/common/MyLink";
import { useMyTheme } from "hooks/common";
import { FiHeart } from "react-icons/fi";
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
    <Drawer isOpen={isOpen} onClose={onClose} size="full" placement="left">
      <DrawerOverlay>
        <DrawerContent bg={bgColor}>
          <DrawerBody pb={16}>
            <Flex align="center" justifyContent="space-between">
              <Flex align="center">
                <ColorModeSwitcher isMobile />
                <LanguageSwitcher isMobile />
                <MyLink
                  isExternal
                  isColored={false}
                  href="https://patreon.com/sendou"
                >
                  <Button
                    variant="ghost"
                    color="current"
                    leftIcon={<FiHeart />}
                    pl={5}
                  >
                    Sponsor
                  </Button>
                </MyLink>
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
