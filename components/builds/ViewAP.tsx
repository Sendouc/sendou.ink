import { Box, Flex } from "@chakra-ui/core";
import { t } from "@lingui/macro";
import { Ability } from "@prisma/client";
import AbilityIcon from "components/common/AbilityIcon";
import { mainOnlyAbilities } from "lib/lists/abilities";
import { useMyTheme } from "lib/useMyTheme";

interface ViewAPProps {
  aps: Record<Ability, number>;
}

const ViewAP: React.FC<ViewAPProps> = ({ aps }) => {
  const { gray } = useMyTheme();

  const APArrays = Object.entries(aps).reduce(
    (acc: [number, string[]][], [key, value]) => {
      const apCount = mainOnlyAbilities.includes(key as any) ? 999 : value;

      const abilityArray = acc.find((el) => el[0] === apCount);

      if (abilityArray) abilityArray[1].push(key);
      else acc.push([apCount, [key]]);

      return acc;
    },
    []
  );

  let indexToPrintAPAt = APArrays[0][0] === 999 ? 1 : 0;

  return (
    <Box mt="2">
      {APArrays.map((arr, index) => {
        return (
          <Flex
            key={arr[0] as any}
            justifyContent="flex-start"
            alignItems="center"
            gridRowGap="2em"
            mt={index === 0 ? "0" : "1em"}
          >
            {arr[0] !== 999 ? (
              <Box mr={2} pr={1} borderRight="1px solid" borderColor={gray}>
                <Box
                  color={gray}
                  width="32px"
                  minH="45px"
                  letterSpacing="wide"
                  fontSize="s"
                  fontWeight="semibold"
                  textAlign="center"
                  pt={indexToPrintAPAt !== index ? "10px" : undefined}
                >
                  {arr[0]}
                  {indexToPrintAPAt === index ? (
                    <>
                      <br />
                      {t`AP`}
                    </>
                  ) : null}
                </Box>
              </Box>
            ) : (
              <Box width="37px" />
            )}
            {(arr[1] as Array<Ability>).map((ability, abilityIndex) => (
              <Box
                width="45px"
                key={ability}
                ml={
                  abilityIndex !== 0 && arr[1].length > 5
                    ? `-${(arr[1].length - 5) * 5}px`
                    : undefined
                }
              >
                <AbilityIcon ability={ability} size="SUB" />
              </Box>
            ))}
          </Flex>
        );
      })}
    </Box>
  );
};

export default ViewAP;
