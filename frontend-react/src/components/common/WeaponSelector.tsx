import React from "react"
import { Flex, Box } from "@chakra-ui/core"
import { weaponSelectOptions } from "../../utils/lists"
import WeaponImage from "./WeaponImage"
import { components } from "react-select"
import Select from "../elements/Select"

interface WeaponSelectorProps {
  setValue: (value: string) => void
  autoFocus?: boolean
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
  autoFocus = false,
}) => {
  return (
    <Select
      options={weaponSelectOptions}
      setValue={setValue}
      placeholder="Select a weapon"
      components={{
        IndicatorSeparator: () => null,
        Option: singleOption,
      }}
      autoFocus={autoFocus}
    />
  )
}

export default WeaponSelector
