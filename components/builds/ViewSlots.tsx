import { Box, BoxProps, Flex } from "@chakra-ui/react";
import AbilityIcon from "components/common/AbilityIcon";
import { AbilityOrUnknown } from "lib/types";

export type ViewSlotsAbilities = {
  headAbilities: AbilityOrUnknown[];
  clothingAbilities: AbilityOrUnknown[];
  shoesAbilities: AbilityOrUnknown[];
};

interface ViewSlotsProps {
  abilities: ViewSlotsAbilities;
  onAbilityClick?: (
    gear: "headAbilities" | "clothingAbilities" | "shoesAbilities",
    index: number
  ) => void;
}

const ViewSlots: React.FC<ViewSlotsProps & BoxProps> = ({
  abilities,
  onAbilityClick,
  ...props
}) => {
  return (
    <Box {...props}>
      <Flex alignItems="center" justifyContent="center">
        {abilities.headAbilities.map((ability, index) => (
          <Box
            mx="3px"
            key={index}
            onClick={
              onAbilityClick
                ? () => onAbilityClick("headAbilities", index)
                : undefined
            }
            cursor={onAbilityClick ? "pointer" : undefined}
          >
            <AbilityIcon
              key={index}
              ability={ability}
              size={index === 0 ? "MAIN" : "SUB"}
            />
          </Box>
        ))}
      </Flex>
      <Flex alignItems="center" justifyContent="center" my="0.5em">
        {abilities.clothingAbilities.map((ability, index) => (
          <Box
            mx="3px"
            key={index}
            onClick={
              onAbilityClick
                ? () => onAbilityClick("clothingAbilities", index)
                : undefined
            }
            cursor={onAbilityClick ? "pointer" : undefined}
          >
            <AbilityIcon
              key={index}
              ability={ability}
              size={index === 0 ? "MAIN" : "SUB"}
            />
          </Box>
        ))}
      </Flex>
      <Flex alignItems="center" justifyContent="center">
        {abilities.shoesAbilities.map((ability, index) => (
          <Box
            mx="3px"
            key={index}
            onClick={
              onAbilityClick
                ? () => onAbilityClick("shoesAbilities", index)
                : undefined
            }
            cursor={onAbilityClick ? "pointer" : undefined}
          >
            <AbilityIcon
              key={index}
              ability={ability}
              size={index === 0 ? "MAIN" : "SUB"}
            />
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default ViewSlots;
