import React from "react"
import { Flex, Box } from "@chakra-ui/core"
import { weaponSelectOptions } from "../../utils/lists"
import WeaponImage from "./WeaponImage"
import { components } from "react-select"
import Select from "../elements/Select"
import { Weapon } from "../../types"

interface WeaponSelectorProps {
  setValue: (value: string) => void
  label?: string
  autoFocus?: boolean
  clearable?: boolean
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
  setValue,
  label,
  clearable,
  autoFocus,
}) => {
  return (
    <>
      {label && (
        <Box mb="0.2em">
          <b>{label}</b>
        </Box>
      )}
      <Select
        options={weaponSelectOptions}
        setValue={setValue}
        placeholder="Select weapon"
        clearable={clearable}
        components={{
          IndicatorSeparator: () => null,
          Option: singleOption,
        }}
        autoFocus={autoFocus}
      />
    </>
  )
}

export default WeaponSelector
