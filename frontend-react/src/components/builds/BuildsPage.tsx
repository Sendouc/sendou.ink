import React from "react"
import { Helmet } from "react-helmet-async"
import { RouteComponentProps } from "@reach/router"
import WeaponSelector from "../common/WeaponSelector"
import { useState } from "react"
import { Weapon, Ability } from "../../types"
import useBreakPoints from "../../hooks/useBreakPoints"
import { abilitiesGameOrder } from "../../utils/lists"
import { Box, Flex, Heading, FormLabel, Switch } from "@chakra-ui/core"
import AbilityIcon from "./AbilityIcon"
import { useContext } from "react"
import MyThemeContext from "../../themeContext"
import useLocalStorage from "@rehooks/local-storage"

const BuildsPage: React.FC<RouteComponentProps> = () => {
  const { themeColor } = useContext(MyThemeContext)
  const [weapon, setWeapon] = useState<Weapon | null>(null)
  const [abilities, setAbilities] = useState<Ability[]>(["T"])
  const [prefersAPView, setAPPreference] = useLocalStorage<boolean>(
    "prefersAPView"
  )
  console.log("prefersAPView", prefersAPView)
  const isSmall = useBreakPoints(870)

  return (
    <>
      <Helmet>
        <title>Builds | sendou.ink</title>
      </Helmet>
      <FormLabel htmlFor="apview">Default to Ability Point view</FormLabel>
      <Switch
        id="apview"
        color={themeColor}
        isChecked={prefersAPView === null ? false : prefersAPView}
        onChange={() => setAPPreference(!prefersAPView)}
      />
      <WeaponSelector
        weapon={weapon}
        setWeapon={(weapon: Weapon | null) => setWeapon(weapon)}
        dropdownMode={isSmall}
      />
      {!weapon && (
        <Flex flexWrap="wrap" justifyContent="center" pt="1em">
          {abilitiesGameOrder.map(ability => (
            <Box
              key={ability}
              p="5px"
              cursor="pointer"
              onClick={() => setAbilities(abilities.concat(ability))}
            >
              <AbilityIcon
                ability={abilities.indexOf(ability) === -1 ? ability : "EMPTY"}
                size="SUB"
              />{" "}
            </Box>
          ))}
        </Flex>
      )}
      {abilities.length > 0 && (
        <>
          <Heading size="sm" mx="auto" width="50%" textAlign="center" pt="1em">
            Only showing builds featuring the following abilities
          </Heading>
          <Flex flexWrap="wrap" justifyContent="center" pt="1em">
            {abilities.map(ability => (
              <Box
                key={ability}
                cursor="pointer"
                p="5px"
                onClick={() =>
                  setAbilities(
                    abilities.filter(
                      abilityInArray => ability !== abilityInArray
                    )
                  )
                }
              >
                <AbilityIcon ability={ability} size="SUB" />{" "}
              </Box>
            ))}
          </Flex>
        </>
      )}
    </>
  )
}

export default BuildsPage
