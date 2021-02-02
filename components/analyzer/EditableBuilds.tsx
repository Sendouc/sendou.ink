import { Box, Button, Flex, IconButton } from "@chakra-ui/react";
import { t } from "@lingui/macro";
import ViewSlots, { ViewSlotsAbilities } from "components/builds/ViewSlots";
import AbilitiesSelector from "components/u/AbilitiesSelector";
import { AbilityOrUnknown } from "lib/types";
import { FiCopy, FiEdit, FiSquare } from "react-icons/fi";
import HeadOnlyToggle from "./HeadOnlyToggle";
import LdeSlider from "./LdeSlider";

interface EditableBuildsProps {
  build: Omit<ViewSlotsAbilities, "weapon">;
  otherBuild: Omit<ViewSlotsAbilities, "weapon">;
  setBuild: React.Dispatch<
    React.SetStateAction<Omit<ViewSlotsAbilities, "weapon">>
  >;
  showOther: boolean;
  setShowOther: React.Dispatch<React.SetStateAction<boolean>>;
  otherFocused: boolean;
  changeFocus: () => void;
  bonusAp: Partial<Record<AbilityOrUnknown, boolean>>;
  setBonusAp: React.Dispatch<
    React.SetStateAction<Partial<Record<AbilityOrUnknown, boolean>>>
  >;
  otherBonusAp: Partial<Record<AbilityOrUnknown, boolean>>;
  setOtherBonusAp: React.Dispatch<
    React.SetStateAction<Partial<Record<AbilityOrUnknown, boolean>>>
  >;
  lde: number;
  otherLde: number;
  setLde: React.Dispatch<React.SetStateAction<number>>;
  setOtherLde: React.Dispatch<React.SetStateAction<number>>;
}

const EditableBuilds: React.FC<EditableBuildsProps> = ({
  build,
  otherBuild,
  setBuild,
  showOther,
  setShowOther,
  otherFocused,
  changeFocus,
  bonusAp,
  setBonusAp,
  otherBonusAp,
  setOtherBonusAp,
  lde,
  otherLde,
  setLde,
  setOtherLde,
}) => {
  const buildToEdit = otherFocused ? otherBuild : build;
  const handleChange = (value: Object) =>
    setBuild({ ...buildToEdit, ...value });

  const handleClickBuildAbility = (
    slot: "headAbilities" | "clothingAbilities" | "shoesAbilities",
    index: number
  ) => {
    const copy = buildToEdit[slot].slice();
    copy[index] = "UNKNOWN";
    handleChange({
      [slot]: copy,
    });
  };

  const headAbility = build.headAbilities ? build.headAbilities[0] : "SSU";
  const otherHeadAbility = otherBuild.headAbilities
    ? otherBuild.headAbilities[0]
    : "SSU";

  const shoesAbility = build.shoesAbilities ? build.shoesAbilities[0] : "SSU";
  const otherShoesAbility = otherBuild.shoesAbilities
    ? otherBuild.shoesAbilities[0]
    : "SSU";

  return (
    <>
      <Button
        leftIcon={showOther ? <FiSquare /> : <FiCopy />}
        onClick={() => {
          if (showOther && otherFocused) {
            changeFocus();
          }
          setShowOther(!showOther);
        }}
        mt="1em"
        mb="2em"
        size="sm"
        variant="outline"
      >
        {showOther ? t`Stop comparing` : t`Compare`}
      </Button>
      <Flex justifyContent="space-evenly" flexWrap="wrap" mb="1em">
        <Flex flexDirection="column">
          {showOther && (
            <IconButton
              aria-label="Edit orange build"
              disabled={!otherFocused}
              colorScheme="orange"
              onClick={() => changeFocus()}
              icon={<FiEdit />}
              isRound
              mx="auto"
            />
          )}
          <ViewSlots
            abilities={build}
            onAbilityClick={!otherFocused ? handleClickBuildAbility : undefined}
            m="1em"
            cursor={!otherFocused ? undefined : "not-allowed"}
          />
          {["OG", "CB"].includes(headAbility) && (
            <HeadOnlyToggle
              ability={headAbility as any}
              active={bonusAp[headAbility] ?? false}
              setActive={() =>
                setBonusAp({
                  ...bonusAp,
                  [headAbility]: !bonusAp[headAbility],
                })
              }
            />
          )}
          {headAbility === "LDE" && (
            <LdeSlider
              value={lde}
              setValue={(value: number) => setLde(value)}
            />
          )}
          {shoesAbility === "DR" && (
            <HeadOnlyToggle
              ability={shoesAbility}
              active={bonusAp[shoesAbility] ?? false}
              setActive={() =>
                setBonusAp({
                  ...bonusAp,
                  [shoesAbility]: !bonusAp[shoesAbility],
                })
              }
            />
          )}
        </Flex>
        {showOther && (
          <Flex flexDirection="column">
            <IconButton
              aria-label="Edit blue build"
              disabled={otherFocused}
              colorScheme="blue"
              onClick={() => changeFocus()}
              icon={<FiEdit />}
              isRound
              mx="auto"
            />
            <ViewSlots
              abilities={otherBuild}
              onAbilityClick={
                otherFocused ? handleClickBuildAbility : undefined
              }
              m="1em"
              cursor={otherFocused ? undefined : "not-allowed"}
            />
            {["OG", "CB"].includes(otherHeadAbility) && (
              <HeadOnlyToggle
                ability={otherHeadAbility as any}
                active={otherBonusAp[otherHeadAbility] ?? false}
                setActive={() =>
                  setOtherBonusAp({
                    ...otherBonusAp,
                    [otherHeadAbility]: !otherBonusAp[otherHeadAbility],
                  })
                }
              />
            )}
            {otherHeadAbility === "LDE" && (
              <LdeSlider
                value={otherLde}
                setValue={(value: number) => setOtherLde(value)}
              />
            )}
            {otherShoesAbility === "DR" && (
              <HeadOnlyToggle
                ability={otherShoesAbility}
                active={otherBonusAp[otherShoesAbility] ?? false}
                setActive={() =>
                  setOtherBonusAp({
                    ...otherBonusAp,
                    [otherShoesAbility]: !otherBonusAp[otherShoesAbility],
                  })
                }
              />
            )}
          </Flex>
        )}
      </Flex>
      <Box mt="1em">
        <AbilitiesSelector
          abilities={otherFocused ? otherBuild : build}
          setAbilities={(newAbilities) => setBuild(newAbilities)}
        />
      </Box>
    </>
  );
};

export default EditableBuilds;
