import { Box, BoxProps, Flex } from "@chakra-ui/react";
import { BuildGetPayload } from "@prisma/client";
import AbilityIcon from "components/common/AbilityIcon";

type BuildViewSlots = Partial<
  BuildGetPayload<{
    select: {
      headAbilities: true;
      clothingAbilities: true;
      shoesAbilities: true;
    };
  }>
>;

interface ViewSlotsProps {
  build: BuildViewSlots;
  onAbilityClick?: (gear: "HEAD" | "CLOTHING" | "SHOES", index: number) => void;
}

// FIXME: fix any
const defaultAbilityRow = ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"] as any[];

const ViewSlots: React.FC<ViewSlotsProps & BoxProps> = ({
  build,
  onAbilityClick,
  ...props
}) => {
  return (
    <Box {...props}>
      <Flex alignItems="center" justifyContent="center">
        {(build.headAbilities ?? defaultAbilityRow).map((ability, index) => (
          <Box
            mx="3px"
            key={index}
            onClick={
              onAbilityClick ? () => onAbilityClick("HEAD", index) : undefined
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
        {(build.clothingAbilities ?? defaultAbilityRow).map(
          (ability, index) => (
            <Box
              mx="3px"
              key={index}
              onClick={
                onAbilityClick
                  ? () => onAbilityClick("CLOTHING", index)
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
          )
        )}
      </Flex>
      <Flex alignItems="center" justifyContent="center">
        {(build.shoesAbilities ?? defaultAbilityRow).map((ability, index) => (
          <Box
            mx="3px"
            key={index}
            onClick={
              onAbilityClick ? () => onAbilityClick("SHOES", index) : undefined
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
