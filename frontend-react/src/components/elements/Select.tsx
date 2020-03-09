import React, { useContext, useState } from "react"
import ReactSelect, { OptionsType, GroupedOptionsType } from "react-select"
import MyThemeContext from "../../themeContext"
import { SelectComponents } from "react-select/src/components"
import Box from "./Box"
import Label from "./Label"

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
  hideMenuBeforeTyping,
  width = "290px",
}) => {
  const {
    colorMode,
    darkerBgColor,
    themeColorHex,
    themeColorHexLighter,
  } = useContext(MyThemeContext)
  const [inputValue, setInputValue] = useState("")

  const handleChange = (selectedOption: any) => {
    if (!setValue) return
    if (!selectedOption) {
      setValue(null)
      return
    }
    if (Array.isArray(selectedOption)) {
      setValue(selectedOption.map(obj => obj.value))
    } else {
      setValue(selectedOption?.value)
    }
  }

  const getValue = () => {
    if (typeof value === "string") {
      return { label: value, value: value }
    } else if (Array.isArray(value)) {
      return value.map(weapon => ({ label: weapon, value: weapon }))
    }

    return value
  }

  return (
    <Box>
      {label && <Label required={required}>{label}</Label>}
      <ReactSelect
        className="basic-single"
        classNamePrefix="select"
        value={getValue()}
        inputValue={inputValue}
        onInputChange={newValue => setInputValue(newValue)}
        menuIsOpen={
          hideMenuBeforeTyping ? !!(inputValue.length >= 3) : undefined
        }
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
        theme={theme => ({
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
          singleValue: base => ({
            ...base,
            padding: 5,
            borderRadius: 5,
            color: colorMode === "light" ? "black" : "white",
            display: "flex",
          }),
          input: base => ({
            ...base,
            color: colorMode === "light" ? "black" : "white",
          }),
          multiValue: base => ({
            ...base,
            background: themeColorHexLighter,
            color: "black",
          }),
        }}
      />
    </Box>
  )
}

export default Select
