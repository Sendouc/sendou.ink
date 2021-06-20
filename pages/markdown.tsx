import { Box, Button, Collapse, Flex, Heading } from "@chakra-ui/react";
import Emoji from "components/common/Emoji";
import MyHead from "components/common/MyHead";
import MyLink from "components/common/MyLink";
import WeaponImage from "components/common/WeaponImage";
import { useState } from "react";
import { abilityMarkdownCodes } from "utils/lists/abilityMarkdownCodes";
import { gearMarkdownCodes } from "utils/lists/gearMarkdownCodes";
import { codeToWeapon } from "utils/lists/weaponCodes";
import { subSpecialWeaponMarkdownCodes } from "utils/lists/subSpecialWeaponMarkdownCodes";

const MarkdownHelpPage = () => {
  const [showWeapons, setShowWeapons] = useState(false);
  const [showSubSpecialWeapons, setShowSubSpecialWeapons] = useState(false);
  const [showAbilities, setShowAbilities] = useState(false);
  const [showGear, setShowGear] = useState(false);
  return (
    <>
      <MyHead title="Markdown help" />
      <Heading size="lg" mb="0.5em">
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
          Big thing we don&apos;t support is embedding images but mostly
          everything else works. Be mindful of some Markdown quirks such as
          needing to use double space after a line and before a linebreak for it
          to display normally.
        </p>
        <p style={{ marginTop: "1em" }}>
          We also support certain special emoji. Below listed are the groups and
          few representatives as example:
        </p>
        <Box as="p" mt={8}>
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
        </Box>
        <Box as="p" mt={8}>
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
            <Box w="250px" mt="0.5em">
              <Button onClick={() => setShowWeapons(!showWeapons)} size="sm">
                {showWeapons ? "Hide" : "Show all"}
              </Button>
            </Box>
            <Collapse in={showWeapons} animateOpacity>
              <Flex flexDir="column">
                {Object.keys(codeToWeapon).map((code) => (
                  <Box key={code}>:{code}:</Box>
                ))}
              </Flex>
            </Collapse>
          </Flex>
        </Box>
        <Box as="p" mt={8}>
          <b>Sub and Special weapons emoji</b>
          <Flex flexDir="column">
            <Box>
              :baller: -{">"} <Emoji value="baller" />
            </Box>
            <Box>
              :ink_armor: -{">"} <Emoji value="ink_armor" />
            </Box>
            <Box>
              :autobomb: -{">"} <Emoji value="autobomb" />
            </Box>
            <Box w="250px" mt="0.5em">
              <Button
                onClick={() => setShowSubSpecialWeapons(!showSubSpecialWeapons)}
                size="sm"
              >
                {showSubSpecialWeapons ? "Hide" : "Show all"}
              </Button>
            </Box>
            <Collapse in={showSubSpecialWeapons} animateOpacity>
              <Flex flexDir="column">
                {Object.keys(subSpecialWeaponMarkdownCodes).map((code) => (
                  <Box key={code}>:{code}:</Box>
                ))}
              </Flex>
            </Collapse>
          </Flex>
        </Box>
        <Box as="p" mt={8}>
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
            <Box w="250px" mt="0.5em">
              <Button
                onClick={() => setShowAbilities(!showAbilities)}
                size="sm"
              >
                {showAbilities ? "Hide" : "Show all"}
              </Button>
            </Box>
            <Collapse in={showAbilities} animateOpacity>
              <Flex flexDir="column">
                {Object.keys(abilityMarkdownCodes).map((code) => (
                  <Box key={code}>:{code}:</Box>
                ))}
              </Flex>
            </Collapse>
          </Flex>
        </Box>
        <Box as="p" mt={8}>
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
            <Box w="250px" mt="0.5em">
              <Button onClick={() => setShowGear(!showGear)} size="sm">
                {showGear ? "Hide" : "Show all"}
              </Button>
            </Box>
            <Collapse in={showGear} animateOpacity>
              <Flex flexDir="column">
                {Object.keys(gearMarkdownCodes).map((code) => (
                  <Box key={code}>:{code}:</Box>
                ))}
              </Flex>
            </Collapse>
          </Flex>
        </Box>
      </Box>
    </>
  );
};

export default MarkdownHelpPage;
