import React from "react"
import { Flex, Box } from "@chakra-ui/core"
import { weaponSelectOptions } from "../../utils/lists"
import WeaponImage from "./WeaponImage"
import { components } from "react-select"
import Select from "../elements/Select"
import { Weapon } from "../../types"

interface WeaponSelectorProps {
  value?: Weapon | Weapon[] | "" | null
  setValue: (value: any) => void
  label: string
  required?: boolean
  autoFocus?: boolean
  clearable?: boolean
  isMulti?: boolean
}

const singleOption = (props: any) => (
  <components.Option {...props}>
    <Flex alignItems="center" color={props.isFocused ? "black" : undefined}>
      <Box mr="0.5em">
        <WeaponImage size="SMALL" englishName={props.label} />
      </Box>
      {props.label}
    </Flex>
  </components.Option>
)

const WeaponSelector: React.FC<WeaponSelectorProps> = ({
  value,
  setValue,
  label,
  clearable,
  autoFocus,
  required,
  isMulti,
}) => {
  return (
    <>
      <Select
        label={label}
        required={required}
        options={weaponSelectOptions}
        value={value}
        setValue={setValue}
        clearable={clearable}
        isSearchable
        isMulti={!!isMulti}
        components={{
          IndicatorSeparator: () => null,
          Option: singleOption,
        }}
        autoFocus={autoFocus}
        width="100%"
      />
    </>
  )
}

export default WeaponSelector
