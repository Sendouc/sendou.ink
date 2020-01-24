import React from "react"
import { Weapon } from "../../types"
import { Input, Flex, PseudoBox, Select, Box } from "@chakra-ui/core"
import { useState } from "react"
import { weapons } from "../../utils/lists"
import WeaponImage from "./WeaponImage"
import { useContext } from "react"
import MyThemeContext from "../../themeContext"
import FieldsetWithLegend from "./FieldsetWithLegend"

interface WeaponSelectorProps {
  weapon: Weapon | null
  setWeapon: (weapon: Weapon | null) => void
  dropdownMode?: boolean
}

const WeaponSelector: React.FC<WeaponSelectorProps> = ({
  weapon,
  setWeapon,
  dropdownMode = false,
}) => {
  const { darkerBgColor } = useContext(MyThemeContext)
  const [input, setInput] = useState("")

  const filterWeaponArray = (weapon: Weapon) =>
    input === "" || weapon.toLowerCase().indexOf(input.toLowerCase()) !== -1

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setInput(event.target.value)

  if (dropdownMode)
    return (
      <Select
        placeholder="Filter weapons"
        value={weapon ?? ""}
        onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
          setWeapon(event.target.value as Weapon)
        }
      >
        {weapons.map(weapon => (
          <option
            key={weapon}
            value={weapon}
            style={{ background: darkerBgColor }}
          >
            {weapon}
          </option>
        ))}
      </Select>
    )

  return (
    <>
      <Box pb="1em">
        <Input
          placeholder="Filter weapons"
          value={input}
          onChange={handleInputChange}
          w="50%"
          ml="auto"
          mr="auto"
          onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key !== "Enter") return
            const oneWeaponArray = weapons.filter(filterWeaponArray)
            if (oneWeaponArray.length !== 1) return
            setWeapon(oneWeaponArray[0])
          }}
          autoFocus
        />
      </Box>
      <FieldsetWithLegend
        title="Click a weapon to select it"
        titleFontSize="md"
        dividerMode
        centerTitle
        fullWidth
      >
        <Flex flexWrap="wrap" justifyContent="center">
          {weapons.filter(filterWeaponArray).map(weapon => (
            <PseudoBox
              key={weapon}
              px="2px"
              cursor="pointer"
              onClick={() => setWeapon(weapon)}
              userSelect="none"
              _hover={{
                bg: "rgba(128, 128, 128, 0.3)",
                borderRadius: "50%",
                transition: "background-color .5s",
              }}
            >
              <WeaponImage englishName={weapon} size="SMALL" />
            </PseudoBox>
          ))}
        </Flex>
      </FieldsetWithLegend>
    </>
  )
}

export default WeaponSelector
