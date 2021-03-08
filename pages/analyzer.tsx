import {
  Badge,
  Box,
  Button,
  Flex,
  FormLabel,
  Switch,
  Wrap,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import BuildStats from "components/analyzer/BuildStats";
import EditableBuilds from "components/analyzer/EditableBuilds";
import { ViewSlotsAbilities } from "components/builds/ViewSlots";
import WeaponSelector from "components/common/WeaponSelector";
import HeaderBanner from "components/layout/HeaderBanner";
import { useMyTheme } from "hooks/common";
import useAbilityEffects from "hooks/useAbilityEffects";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FiSettings } from "react-icons/fi";
import { isAbilityArray } from "utils/lists/abilities";
import { isWeapon } from "utils/lists/weapons";
import { AbilityOrUnknown } from "utils/types";

const CURRENT_PATCH = "5.4.";

const defaultBuild: ViewSlotsAbilities = {
  headAbilities: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
  clothingAbilities: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
  shoesAbilities: ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
};

const BuildAnalyzerPage = () => {
  const router = useRouter();
  const { gray } = useMyTheme();
  const [build, setBuild] = useState<ViewSlotsAbilities>({
    ...defaultBuild,
  });
  const [otherBuild, setOtherBuild] = useState<ViewSlotsAbilities>({
    ...defaultBuild,
  });
  const [weapon, setWeapon] = useState("Splattershot Jr.");
  const [showOther, setShowOther] = useState(false);
  const [showNotActualProgress, setShowNotActualProgress] = useState(false);
  const [startChartsAtZero, setStartChartsAtZero] = useState(true);
  const [otherFocused, setOtherFocused] = useState(false);
  const [hideExtra, setHideExtra] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const [bonusAp, setBonusAp] = useState<
    Partial<Record<AbilityOrUnknown, boolean>>
  >({});
  const [otherBonusAp, setOtherBonusAp] = useState<
    Partial<Record<AbilityOrUnknown, boolean>>
  >({});
  const [lde, setLde] = useState(0);
  const [otherLde, setOtherLde] = useState(0);

  const explanations = useAbilityEffects({
    abilities: build,
    weapon,
    bonusAp,
    lde,
  });
  const otherExplanations = useAbilityEffects({
    abilities: otherBuild,
    weapon,
    bonusAp: otherBonusAp,
    lde: otherLde,
  });

  useEffect(parseQuery, []);

  return (
    <>
      <Flex justifyContent="space-between">
        <Badge>
          <Trans>Patch {CURRENT_PATCH}</Trans>
        </Badge>
        <Box color={gray} fontSize="0.75em">
          <Trans>AP = Ability Point = Mains * 10 + Subs * 3</Trans>
        </Box>
      </Flex>

      <Box my={4} maxW={80} mx="auto">
        <WeaponSelector value={weapon} setValue={setWeapon} isMulti={false} />
      </Box>
      <Wrap justify="space-between">
        <Box>
          <Box position="sticky" top={0}>
            {weapon && (
              <EditableBuilds
                build={build}
                otherBuild={otherBuild}
                setBuild={otherFocused ? setOtherBuild : setBuild}
                showOther={showOther}
                setShowOther={setShowOther}
                changeFocus={() => {
                  setOtherFocused(!otherFocused);
                }}
                otherFocused={otherFocused}
                bonusAp={bonusAp}
                setBonusAp={setBonusAp}
                otherBonusAp={otherBonusAp}
                setOtherBonusAp={setOtherBonusAp}
                lde={lde}
                setLde={setLde}
                otherLde={otherLde}
                setOtherLde={setOtherLde}
              />
            )}
          </Box>
        </Box>
        <Box>
          <Button
            leftIcon={<FiSettings />}
            onClick={() => setShowSettings(!showSettings)}
            my="1rem"
            size="sm"
            variant="outline"
          >
            {showSettings ? t`Hide settings` : t`Show settings`}
          </Button>
          {showSettings && (
            <Box my="1em">
              <Switch
                id="show-all"
                color="blue"
                isChecked={hideExtra}
                onChange={() => setHideExtra(!hideExtra)}
                mr="0.5em"
              />
              <FormLabel htmlFor="show-all">
                {t`Hide stats at base value`}
              </FormLabel>

              <Box>
                <Switch
                  id="show-not-actual"
                  color="blue"
                  isChecked={showNotActualProgress}
                  onChange={() =>
                    setShowNotActualProgress(!showNotActualProgress)
                  }
                  mr="0.5em"
                />
                <FormLabel htmlFor="show-not-actual">
                  {t`Progress bars show progress to max value`}
                </FormLabel>
              </Box>
              <Box>
                <Switch
                  id="charts-zero"
                  color="blue"
                  isChecked={startChartsAtZero}
                  onChange={() => setStartChartsAtZero(!startChartsAtZero)}
                  mr="0.5em"
                />
                <FormLabel htmlFor="charts-zero">
                  {t`Start charts Y axis from zero`}
                </FormLabel>
              </Box>
            </Box>
          )}
          <Box m="1rem" w={["95%", null, "30rem"]}>
            <BuildStats
              build={build}
              explanations={explanations}
              otherExplanations={showOther ? otherExplanations : undefined}
              hideExtra={hideExtra}
              showNotActualProgress={showNotActualProgress}
              startChartsAtZero={startChartsAtZero}
            />
          </Box>
        </Box>
      </Wrap>
    </>
  );

  function parseQuery() {
    const query = router.query;

    const weapon = isWeapon(query.weapon) ? query.weapon : "Splattershot Jr.";
    const headAbilities =
      typeof query.head === "string" &&
      isAbilityArray(query.head.split(","), "HEAD")
        ? query.head.split(",")
        : ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"];
    const clothingAbilities =
      typeof query.clothing === "string" &&
      isAbilityArray(query.clothing.split(","), "CLOTHING")
        ? query.clothing.split(",")
        : ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"];
    const shoesAbilities =
      typeof query.shoes === "string" &&
      isAbilityArray(query.shoes.split(","), "SHOES")
        ? query.shoes.split(",")
        : ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"];

    setWeapon(weapon as string);
    setBuild({
      headAbilities: headAbilities as AbilityOrUnknown[],
      clothingAbilities: clothingAbilities as AbilityOrUnknown[],
      shoesAbilities: shoesAbilities as AbilityOrUnknown[],
    });
  }
};

BuildAnalyzerPage.header = (
  <HeaderBanner
    icon="analyzer"
    title="Build Analyzer"
    subtitle="Discover what your builds are actually doing"
  />
);

export default BuildAnalyzerPage;
