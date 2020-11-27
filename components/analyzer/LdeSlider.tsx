import {
  Box,
  Flex,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import AbilityIcon from "components/common/AbilityIcon";
import { useMyTheme } from "lib/useMyTheme";

interface LdeSliderProps {
  value: number;
  setValue: (value: number) => void;
}

const LdeSlider: React.FC<LdeSliderProps> = ({ value, setValue }) => {
  const { themeColorShade, gray } = useMyTheme();
  const bonusAp = Math.floor((24 / 21) * value);

  const getLdeEffect = () => {
    if (value === 21)
      return t`Enemy has reached the 30 point mark OR there is 30 seconds or less on the clock OR it is overtime`;

    const pointMark = 51 - value;
    if (value > 0)
      return <Trans>Enemy has reached the {pointMark} point mark</Trans>;
    return t`Enemy has not reached the 50 point mark or there is more than 30 seconds on the clock`;
  };
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      mb="1em"
    >
      <Text
        fontSize="sm"
        color={gray}
        textTransform="uppercase"
        letterSpacing="wider"
        lineHeight="1rem"
        fontWeight="medium"
        mb={1}
      >
        {t`Intensity`}
      </Text>
      <NumberInput
        size="lg"
        defaultValue={0}
        min={0}
        max={21}
        value={value}
        onChange={(_, value) => setValue(value)}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
      {value > 0 && (
        <Box color={themeColorShade} fontWeight="bold" mt="1em">
          +{bonusAp}
          {t`AP`}{" "}
          {["ISM", "ISS", "REC"].map((ability) => (
            <Box as="span" mx="0.2em" key={ability}>
              <AbilityIcon ability={ability as any} size="SUBTINY" />
            </Box>
          ))}
        </Box>
      )}
      <Box
        color={gray}
        fontSize="0.75em"
        maxW="200px"
        mt="1em"
        textAlign="center"
      >
        {getLdeEffect()}
      </Box>
    </Flex>
  );
};

export default LdeSlider;
