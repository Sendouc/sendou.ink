import {
  IconButton,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup
} from "@chakra-ui/core"
import React, { useContext } from "react"
import { useTranslation } from "react-i18next"
import { FiGlobe } from "react-icons/fi"
import MyThemeContext from "../../themeContext"

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
] as const

export const LanguageSelector = () => {
  const { t, i18n } = useTranslation()
  const { darkerBgColor, textColor } = useContext(MyThemeContext)

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
      <MenuList bg={darkerBgColor} color={textColor}>
        <MenuOptionGroup
          title={t("navigation;Choose language")}
          value={i18n.language}
        >
          {languages.map((lang) => (
            <MenuItemOption
              key={lang.code}
              value={lang.code}
              onClick={() => i18n.changeLanguage(lang.code)}
            >
              {lang.name}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  )
}
