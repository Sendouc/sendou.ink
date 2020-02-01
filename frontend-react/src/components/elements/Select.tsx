import React, { useContext } from "react"
import ReactSelect, {
  components,
  OptionsType,
  GroupedOptionsType,
  ValueType,
  OptionTypeBase,
  createFilter,
} from "react-select"
import MyThemeContext from "../../themeContext"
import { SelectComponents } from "react-select/src/components"

interface SelectProps {
  options:
    | OptionsType<{
        label: string
        value: string
      }>
    | GroupedOptionsType<{
        label: string
        value: string
      }>
  placeholder: string
  setValue: (value: string) => void
  autoFocus?: boolean
  components?: Partial<
    SelectComponents<{
      label: string
      value: string
    }>
  >
  clearable?: boolean
}

const Select: React.FC<SelectProps> = ({
  options,
  components,
  placeholder,
  setValue,
  clearable,
  autoFocus,
}) => {
  const {
    colorMode,
    darkerBgColor,
    themeColorHex,
    themeColorHexLighter,
  } = useContext(MyThemeContext)

  const handleChange = (selectedOption: any) => {
    setValue(selectedOption?.value)
  }

  return (
    <ReactSelect
      className="basic-single"
      classNamePrefix="select"
      onChange={handleChange}
      placeholder={placeholder}
      isSearchable
      isClearable={clearable}
      options={options}
      components={{
        IndicatorSeparator: () => null,
        ...components,
      }}
      theme={theme => ({
        ...theme,
        borderRadius: 5,
        colors: {
          ...theme.colors,
          primary25: `${themeColorHexLighter}`,
          primary: `${themeColorHex}`,
          neutral0: darkerBgColor,
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
      }}
    />
  )
}

export default Select
