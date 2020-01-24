import React from "react"
import { Weapon } from "../../types"
import { Input, Flex, PseudoBox, Select } from "@chakra-ui/core"
import { useState } from "react"
import { weapons } from "../../utils/lists"
import WeaponImage from "./WeaponImage"
import { useContext } from "react"
import MyThemeContext from "../../themeContext"

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
        placeholder="Select a weapon"
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
      <Input
        placeholder="Click below or search for a weapon"
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
      <Flex flexWrap="wrap" justifyContent="center" pt="1em">
        {weapons.filter(filterWeaponArray).map(weapon => (
          <PseudoBox
            key={weapon}
            px="3px"
            py="2px"
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
    </>
  )
}

export default WeaponSelector
