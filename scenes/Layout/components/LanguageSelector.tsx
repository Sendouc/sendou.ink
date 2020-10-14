import {
  IconButton,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
} from "@chakra-ui/core";
import { useTranslation } from "lib/useMockT";
import { useMyTheme } from "lib/useMyTheme";
import React from "react";
import { FiGlobe } from "react-icons/fi";

export const languages = [
  { code: "de", name: "Deutsch" },
  { code: "en", name: "English" },
  { code: "es-ES", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "it", name: "Italiano" },
  { code: "nl", name: "Nederlands" },
  { code: "pt-BR", name: "Português" },
  { code: "sv", name: "Svenska" },
  { code: "el", name: "Ελληνικά" },
  { code: "ru", name: "Русский" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "zh-TW", name: "繁體中文" },
] as const;

export const LanguageSelector = () => {
  const { t } = useTranslation();
  const { secondaryBgColor, textColor } = useMyTheme();

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Switch language"
        variant="ghost"
        fontSize="20px"
        icon={<FiGlobe />}
        borderRadius="50%"
        color={textColor}
      />
      <MenuList bg={secondaryBgColor} color={textColor}>
        <MenuOptionGroup
          title={t("navigation;Choose language")}
          // FIXME
          //value={i18n.language}
          value="en"
        >
          {languages.map((lang) => (
            <MenuItemOption
              key={lang.code}
              value={lang.code}
              // FIXME
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
