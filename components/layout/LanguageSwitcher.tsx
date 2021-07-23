import {
  IconButton,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  useColorMode,
} from "@chakra-ui/react";
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { CSSVariables } from "utils/CSSVariables";
import React from "react";
import { FiGlobe } from "react-icons/fi";
import { activateLocale } from "utils/i18n";

export const languages = [
  { code: "de", name: "Deutsch" },
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "it", name: "Italiano" },
  { code: "nl", name: "Nederlands" },
  { code: "pt", name: "Português" },
  { code: "sv", name: "Svenska" },
  { code: "el", name: "Ελληνικά" },
  { code: "ru", name: "Русский" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  //{ code: "zh", name: "繁體中文" },
  { code: "he", name: "עברית" },
] as const;

export const LanguageSwitcher = ({ isMobile }: { isMobile?: boolean }) => {
  const { colorMode } = useColorMode();
  const { i18n } = useLingui();

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        data-cy="color-mode-toggle"
        aria-label="Switch language"
        variant="ghost"
        color="current"
        icon={<FiGlobe />}
        _hover={
          colorMode === "dark"
            ? { bg: "white", color: "black" }
            : { bg: "black", color: "white" }
        }
        borderRadius={isMobile ? "50%" : "0"}
        size={isMobile ? "lg" : "sm"}
        height="50px"
        display={isMobile ? "flex" : ["none", null, null, "flex"]}
      />
      <MenuList
        bg={CSSVariables.secondaryBgColor}
        color={CSSVariables.textColor}
      >
        <MenuOptionGroup
          title={t`Choose language`}
          value={i18n.locale}
          onChange={(newLocale) => {
            window.localStorage.setItem("locale", newLocale as string);
            activateLocale(newLocale as string);
          }}
        >
          {languages.map((lang) => (
            <MenuItemOption key={lang.code} value={lang.code}>
              {lang.name}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  );
};

export default LanguageSwitcher;
