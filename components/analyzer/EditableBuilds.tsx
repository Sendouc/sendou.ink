import { Box, Button, Flex, IconButton } from "@chakra-ui/react";
import { t } from "@lingui/macro";
import ViewSlots, { ViewSlotsAbilities } from "components/builds/ViewSlots";
import AbilitiesSelector from "components/u/AbilitiesSelector";
import { FiCopy, FiEdit, FiRotateCw, FiSquare } from "react-icons/fi";
import { AbilityOrUnknown } from "utils/types";
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
  resetBuild: () => void;
  resetOtherBuild: () => void;
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
  resetBuild,
  resetOtherBuild,
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

  const isBuildEmpty = (build: Omit<ViewSlotsAbilities, "weapon">) => {
    return [
      ...build.headAbilities,
      ...build.clothingAbilities,
      ...build.shoesAbilities,
    ].every((ability) => ability === "UNKNOWN");
  };

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
          <Flex justifyContent="center">
            {showOther && (
              <IconButton
                aria-label="Edit orange build"
                disabled={!otherFocused}
                colorScheme="orange"
                onClick={changeFocus}
                icon={<FiEdit />}
                isRound
              />
            )}
            <IconButton
              aria-label={showOther ? "Reset orange build" : "Reset build"}
              colorScheme="gray"
              onClick={resetBuild}
              visibility={isBuildEmpty(build) ? "hidden" : "visible"}
              icon={<FiRotateCw />}
              ml="1em"
              isRound
            />
          </Flex>
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
            <Flex justifyContent="center">
              <IconButton
                aria-label="Edit blue build"
                disabled={otherFocused}
                colorScheme="blue"
                onClick={changeFocus}
                icon={<FiEdit />}
                isRound
              />
              <IconButton
                aria-label="Reset blue build"
                colorScheme="gray"
                onClick={resetOtherBuild}
                icon={<FiRotateCw />}
                visibility={isBuildEmpty(otherBuild) ? "hidden" : "visible"}
                ml="1em"
                isRound
              />
            </Flex>
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
