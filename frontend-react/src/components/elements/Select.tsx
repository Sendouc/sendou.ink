import React, { useContext, useState } from "react"
import ReactSelect, { OptionsType, GroupedOptionsType } from "react-select"
import MyThemeContext from "../../themeContext"
import { SelectComponents } from "react-select/src/components"
import Label from "./Label"
import { Box } from "@chakra-ui/core"
import { weapons } from "../../utils/lists"
import { useTranslation } from "react-i18next"

interface SelectProps {
  options?:
    | OptionsType<{
        label: string
        value: string
      }>
    | GroupedOptionsType<{
        label: string
        value: string
      }>
  width?: string
  label?: string
  required?: boolean
  value?:
    | {
        label: string
        value: string
      }
    | string
    | string[]
    | null
  setValue?: (value: any) => void
  autoFocus?: boolean
  components?: Partial<
    SelectComponents<{
      label: string
      value: string
    }>
  >
  clearable?: boolean
  isMulti?: boolean
  isLoading?: boolean
  isDisabled?: boolean
  isSearchable?: boolean
  menuIsOpen?: boolean
  hideMenuBeforeTyping?: boolean
}

const Select: React.FC<SelectProps> = ({
  options,
  components,
  value,
  setValue,
  clearable,
  autoFocus,
  label,
  required,
  isMulti,
  isLoading,
  isDisabled,
  isSearchable,
  menuIsOpen,
  hideMenuBeforeTyping,
}) => {
  const {
    colorMode,
    darkerBgColor,
    themeColorHex,
    themeColorHexLighter,
  } = useContext(MyThemeContext)
  const { t } = useTranslation()
  const [inputValue, setInputValue] = useState("")

  const handleChange = (selectedOption: any) => {
    if (!setValue) return
    if (!selectedOption) {
      setValue(null)
      return
    }
    if (Array.isArray(selectedOption)) {
      setValue(selectedOption.map((obj) => obj.value))
    } else {
      setValue(selectedOption?.value)
    }
  }

  const getValue = () => {
    if (typeof value === "string") {
      return {
        label: weapons.includes(value as any) ? t(`game;${value}`) : value,
        value: value,
      }
    } else if (Array.isArray(value)) {
      return value.map((weapon) => ({
        label: weapons.includes(weapon as any) ? t(`game;${weapon}`) : weapon,
        value: weapon,
      }))
    }

    return value
  }

  const getOptionColor = (focused: boolean) => {
    if (focused) return "black"

    return colorMode === "light" ? "black" : "white"
  }

  const menuIsOpenCheck = () => {
    if (menuIsOpen) return true
    if (hideMenuBeforeTyping) {
      return !!(inputValue.length >= 3)
    }

    return undefined
  }

  return (
    <Box>
      {label && <Label required={required}>{label}</Label>}
      <ReactSelect
        className="basic-single"
        classNamePrefix="select"
        value={getValue()}
        inputValue={inputValue}
        onInputChange={(newValue) => setInputValue(newValue)}
        menuIsOpen={menuIsOpenCheck()}
        onChange={handleChange}
        placeholder={null}
        isSearchable={!!isSearchable}
        isMulti={!!isMulti}
        isLoading={isLoading}
        isDisabled={isDisabled}
        isClearable={isMulti ? false : clearable}
        options={options}
        components={
          hideMenuBeforeTyping
            ? {
                IndicatorSeparator: () => null,
                DropdownIndicator: () => null,
                ...components,
              }
            : {
                IndicatorSeparator: () => null,
                ...components,
              }
        }
        theme={(theme) => ({
          ...theme,
          borderRadius: 5,
          colors: {
            ...theme.colors,
            primary25: `${themeColorHexLighter}`,
            primary: `${themeColorHex}`,
            neutral0: darkerBgColor,
            neutral5: darkerBgColor,
          },
        })}
        autoFocus={autoFocus}
        styles={{
          singleValue: (base) => ({
            ...base,
            padding: 5,
            borderRadius: 5,
            color: colorMode === "light" ? "black" : "white",
            display: "flex",
          }),
          input: (base) => ({
            ...base,
            color: colorMode === "light" ? "black" : "white",
          }),
          multiValue: (base) => ({
            ...base,
            background: themeColorHexLighter,
            color: "black",
          }),
          option: (styles, { data, isDisabled, isFocused, isSelected }) => {
            return {
              ...styles,
              backgroundColor: isFocused ? themeColorHexLighter : undefined,
              color: getOptionColor(isFocused),
            }
          },
        }}
      />
    </Box>
  )
}

export default Select
