import { Box, Button, Collapse, Flex, Heading } from "@chakra-ui/react";
import Emoji from "components/common/Emoji";
import MyHead from "components/common/MyHead";
import MyLink from "components/common/MyLink";
import WeaponImage from "components/common/WeaponImage";
import { useState } from "react";
import { abilityMarkdownCodes } from "utils/lists/abilityMarkdownCodes";
import { gearMarkdownCodes } from "utils/lists/gearMarkdownCodes";
import { codeToWeapon } from "utils/lists/weaponCodes";

const MarkdownHelpPage = () => {
  const [showWeapons, setShowWeapons] = useState(false);
  const [showAbilities, setShowAbilities] = useState(false);
  const [showGear, setShowGear] = useState(false);
  return (
    <>
      <MyHead title="Markdown help" />
      <Heading size="lg" mb="0.5em" fontFamily="'Rubik', sans-serif">
        Markdown help
      </Heading>
      <Box>
        <p>
          You are already familiar with Markdown since you have used Discord.
          There are several good resources online to help you learn Markdown.
          One good one is the one{" "}
          <MyLink
            href="https://guides.github.com/features/mastering-markdown/"
            isExternal
          >
            GitHub provides.
          </MyLink>{" "}
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
        <Box as="p" mt={6}>
          <b>Weapon emoji</b>
          <Flex flexDir="column">
            <Box>
              :luna_blaster: -{">"}{" "}
              <WeaponImage size={32} name="Luna Blaster" />
            </Box>
            <Box>
              :96_gal: -{">"} <WeaponImage size={32} name=".96 Gal" />
            </Box>
            <Box>
              :custom_e-liter_4k_scope: -{">"}{" "}
              <WeaponImage size={32} name="Custom E-liter 4K Scope" />
            </Box>
            <Box w="250px" mt="0.5em" mb={6}>
              <Button onClick={() => setShowWeapons(!showWeapons)} size="sm">
                {showWeapons ? "Hide" : "Show all"}
              </Button>
            </Box>
            <Collapse in={showWeapons} animateOpacity>
              <Flex flexDir="column">
                {Object.keys(codeToWeapon).map((code) => (
                  <Box>:{code}:</Box>
                ))}
              </Flex>
            </Collapse>
          </Flex>
        </Box>
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
              <Button
                onClick={() => setShowAbilities(!showAbilities)}
                size="sm"
                mt="0.5em"
                mb={6}
              >
                {showAbilities ? "Hide" : "Show all"}
              </Button>
            </Box>
            <Collapse in={showAbilities} animateOpacity>
              <Flex flexDir="column">
                {Object.keys(abilityMarkdownCodes).map((code) => (
                  <Box>:{code}:</Box>
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
              <Button
                onClick={() => setShowGear(!showGear)}
                size="sm"
                mt="0.5em"
                mb={6}
              >
                {showGear ? "Hide" : "Show all"}
              </Button>
            </Box>
            <Collapse in={showGear} animateOpacity>
              <Flex flexDir="column">
                {Object.keys(gearMarkdownCodes).map((code) => (
                  <Box>:{code}:</Box>
                ))}
              </Flex>
            </Collapse>
          </Flex>
        </p>
      </Box>
    </>
  );
};

export default MarkdownHelpPage;
