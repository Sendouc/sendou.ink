import {
  IconButton,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
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
  const { i18n } = useTranslation()
  const { darkerBgColor } = useContext(MyThemeContext)
  console.log(i18n.language)
  return (
    <Menu>
      <MenuButton>
        <IconButton
          aria-label="Switch language"
          variant="ghost"
          color="current"
          fontSize="20px"
          icon={<FiGlobe />}
          borderRadius="50%"
        />
      </MenuButton>
      <MenuList bg={darkerBgColor}>
        <MenuOptionGroup title="Choose language" value={i18n.language}>
          {languages.map((lang) => (
            <MenuItemOption
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
