import { Box, Collapse, Flex, Link } from "@chakra-ui/core"
import { RouteComponentProps } from "@reach/router"
import React, { useContext, useState } from "react"
import MyThemeContext from "../../themeContext"
import { abilitiesGameOrder, gearCodes, weaponCodes } from "../../utils/lists"
import PageHeader from "../common/PageHeader"
import WeaponImage from "../common/WeaponImage"
import Button from "../elements/Button"
import Emoji from "../elements/Emoji"

const MarkdownHelpPage: React.FC<RouteComponentProps> = () => {
  const { themeColorWithShade } = useContext(MyThemeContext)
  const [showWeapons, setShowWeapons] = useState(false)
  const [showAbilities, setShowAbilities] = useState(false)
  const [showGear, setShowGear] = useState(false)
  return (
    <>
      <PageHeader title="Markdown Help" />
      <Box>
        <p>
          You are already familiar with Markdown since you have used Discord.
          There are several good resources online to help you learn Markdown.
          One good one is the one{" "}
          <Link
            href="https://guides.github.com/features/mastering-markdown/"
            color={themeColorWithShade}
          >
            GitHub provides.
          </Link>{" "}
          Big thing we don't support is embedding images but mostly everything
          else works. Be mindful of some Markdown quirks such as needing to use
          double space after a line and before a linebreak for it to display
          normally.
        </p>
        <p style={{ marginTop: "1em" }}>
          We also support certain special emoji. Below listed are the groups and
          few representatives as example:
        </p>
        <p style={{ marginTop: "0.5em" }}>
          <b>Mode emoji</b>
          <Flex flexDir="column">
            <Box>
              :turf_war: -{">"} <Emoji value=":turf_war:" />
            </Box>
            <Box>
              :splat_zones: -{">"} <Emoji value=":splat_zones:" />
            </Box>
            <Box>
              :tower_control: -{">"} <Emoji value=":tower_control:" />
            </Box>
            <Box>
              :rainmaker: -{">"} <Emoji value=":rainmaker:" />
            </Box>
            <Box>
              :clam_blitz: -{">"} <Emoji value=":clam_blitz:" />
            </Box>
          </Flex>
        </p>
        <p style={{ marginTop: "0.5em" }}>
          <b>Weapon emoji</b>
          <Flex flexDir="column">
            <Box>
              :luna_blaster: -{">"}{" "}
              <WeaponImage size="SMALL" englishName="Luna Blaster" />
            </Box>
            <Box>
              :96_gal: -{">"} <WeaponImage size="SMALL" englishName=".96 Gal" />
            </Box>
            <Box>
              :custom_e-liter_4k_scope: -{">"}{" "}
              <WeaponImage size="SMALL" englishName="Custom E-liter 4K Scope" />
            </Box>
            <Box w="250px" my="0.5em">
              <Button onClick={() => setShowWeapons(!showWeapons)}>
                {showWeapons ? "Hide" : "Show all"}
              </Button>
            </Box>
            <Collapse mt={4} isOpen={showWeapons}>
              <Flex flexDir="column">
                {Object.keys(weaponCodes).map((code) => (
                  <Box>:{code}:</Box>
                ))}
              </Flex>
            </Collapse>
          </Flex>
        </p>
        <p style={{ marginTop: "0.5em" }}>
          <b>Ability emoji</b>
          <Flex flexDir="column">
            <Box>
              :ssu: -{">"} <Emoji value=":ssu:" />
            </Box>
            <Box>
              :t: -{">"} <Emoji value=":t:" />
            </Box>
            <Box>
              :rp: -{">"} <Emoji value=":rp:" />
            </Box>
            <Box w="250px" my="0.5em">
              <Button onClick={() => setShowAbilities(!showAbilities)}>
                {showAbilities ? "Hide" : "Show all"}
              </Button>
            </Box>
            <Collapse mt={4} isOpen={showAbilities}>
              <Flex flexDir="column">
                {abilitiesGameOrder.map((code) => (
                  <Box>:{code.toLowerCase()}:</Box>
                ))}
              </Flex>
            </Collapse>
          </Flex>
        </p>
        <p style={{ marginTop: "0.5em" }}>
          <b>Gear emoji</b>
          <Flex flexDir="column">
            <Box>
              :power_armor: -{">"} <Emoji value=":power_armor:" />
            </Box>
            <Box>
              :olive_zekko_parka: -{">"} <Emoji value=":olive_zekko_parka:" />
            </Box>
            <Box>
              :black_norimaki_750s: -{">"}{" "}
              <Emoji value=":black_norimaki_750s:" />
            </Box>
            <Box w="250px" my="0.5em">
              <Button onClick={() => setShowGear(!showGear)}>
                {showGear ? "Hide" : "Show all"}
              </Button>
            </Box>
            <Collapse mt={4} isOpen={showGear}>
              <Flex flexDir="column">
                {Object.keys(gearCodes).map((code) => (
                  <Box>:{code}:</Box>
                ))}
              </Flex>
            </Collapse>
          </Flex>
        </p>
      </Box>
    </>
  )
}

export default MarkdownHelpPage
