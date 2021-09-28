import { Box, Divider, Flex } from "@chakra-ui/react";
import { ViewSlotsAbilities } from "components/builds/ViewSlots";
import AbilityIcon from "components/common/AbilityIcon";
import { abilities as allAbilities } from "utils/lists/abilities";

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

type AbilityObject = ArrayElement<typeof allAbilities>;

interface Props {
  abilities: ViewSlotsAbilities;
  setAbilities: (newAbilities: ViewSlotsAbilities) => void;
}

const AbilitiesSelector: React.FC<Props> = ({ abilities, setAbilities }) => {
  const getModifiedAbilities = (
    newAbility: string,
    abilityArray: "headAbilities" | "clothingAbilities" | "shoesAbilities",
    indexToModify: number
  ) => {
    return {
      ...abilities,
      [abilityArray]: abilities[abilityArray].map((abilityCode, index) =>
        index === indexToModify ? newAbility : abilityCode
      ),
    };
  };

  const handleMainAbilityClick = (ability: AbilityObject) => {
    switch (ability.type) {
      case "HEAD":
        if (abilities.headAbilities[0] !== "UNKNOWN") return;

        setAbilities(getModifiedAbilities(ability.code, "headAbilities", 0));
        break;
      case "CLOTHING":
        if (abilities.clothingAbilities[0] !== "UNKNOWN") return;

        setAbilities(
          getModifiedAbilities(ability.code, "clothingAbilities", 0)
        );
        break;
      case "SHOES":
        if (abilities.shoesAbilities[0] !== "UNKNOWN") return;

        setAbilities(getModifiedAbilities(ability.code, "shoesAbilities", 0));
        break;
      default:
        throw Error("invalid main ability type");
    }
  };

  const handleSubAbilityClick = (ability: AbilityObject) => {
    const headUnknownIndex = abilities.headAbilities.findIndex(
      (abilityCode) => abilityCode === "UNKNOWN"
    );
    if (headUnknownIndex !== -1) {
      setAbilities(
        getModifiedAbilities(ability.code, "headAbilities", headUnknownIndex)
      );
      return;
    }

    const clothingUnknownIndex = abilities.clothingAbilities.findIndex(
      (abilityCode) => abilityCode === "UNKNOWN"
    );
    if (clothingUnknownIndex !== -1) {
      setAbilities(
        getModifiedAbilities(
          ability.code,
          "clothingAbilities",
          clothingUnknownIndex
        )
      );
      return;
    }

    const shoesUnknownIndex = abilities.shoesAbilities.findIndex(
      (abilityCode) => abilityCode === "UNKNOWN"
    );
    if (shoesUnknownIndex !== -1) {
      setAbilities(
        getModifiedAbilities(ability.code, "shoesAbilities", shoesUnknownIndex)
      );
      return;
    }
  };

  return (
    <>
      <Flex
        flexWrap="wrap"
        justifyContent="center"
        maxW="340px"
        mx="auto"
        mt={8}
      >
        {allAbilities
          .filter((ability) => ability.type !== "STACKABLE")
          .map((ability) => (
            <Box
              m="0.3em"
              key={ability.code}
              cursor="pointer"
              onClick={() => handleMainAbilityClick(ability)}
            >
              <AbilityIcon ability={ability.code} size="SUB" />
            </Box>
          ))}
      </Flex>
      <Divider maxWidth={64} my={4} mx="auto" />
      <Flex flexWrap="wrap" justifyContent="center" maxW="350px" mx="auto">
        {allAbilities
          .filter((ability) => ability.type === "STACKABLE" && ability.code !== "UNKNOWN")
          .map((ability) => (
            <Box
              m="0.3em"
              key={ability.code}
              cursor="pointer"
              onClick={() => handleSubAbilityClick(ability)}
            >
              {ability.code === "OG" && <br />}
              <AbilityIcon ability={ability.code} size="SUB" />
            </Box>
          ))}
      </Flex>
    </>
  );
};

export default AbilitiesSelector;
