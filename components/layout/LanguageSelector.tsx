import {
  IconButton,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
} from "@chakra-ui/react";
import { t } from "@lingui/macro";
import { useMyTheme } from "lib/useMyTheme";
import React from "react";
import { FiGlobe } from "react-icons/fi";

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
  { code: "zh", name: "繁體中文" },
] as const;

export const LanguageSelector = () => {
  const { secondaryBgColor, textColor } = useMyTheme();

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Switch language"
        variant="ghost"
        fontSize="20px"
        icon={<FiGlobe />}
        isRound
        color={textColor}
      />
      <MenuList bg={secondaryBgColor} color={textColor}>
        <MenuOptionGroup
          title={t`Choose language`}
          // TODO
          //value={i18n.language}
          value="en"
        >
          {languages.map((lang) => (
            <MenuItemOption
              key={lang.code}
              value={lang.code}
              // TODO
              //onClick={() => i18n.changeLanguage(lang.code)}
              onClick={() => console.log(lang.code)}
            >
              {lang.name}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  );
};
