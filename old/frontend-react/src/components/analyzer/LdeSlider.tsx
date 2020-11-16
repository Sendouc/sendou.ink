import {
    Box,
    Flex,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Text
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { Trans, useTranslation } from "react-i18next";
import MyThemeContext from "../../themeContext";
import AbilityIcon from "../builds/AbilityIcon";

interface LdeSliderProps {
  value: number;
  setValue: (value: number) => void;
}

const LdeSlider: React.FC<LdeSliderProps> = ({ value, setValue }) => {
  const { themeColorWithShade, grayWithShade } = useContext(MyThemeContext);
  const { t } = useTranslation();
  const bonusAp = Math.floor((24 / 21) * value);

  const getLdeEffect = () => {
    if (value === 21) return t("analyzer;ldeFullEffectExplanation");

    const pointMark = 51 - value;
    if (value > 0)
      return (
        <Trans i18nKey="analyzer;ldeInBetweenExplanation">
          Enemy has reached the {{ pointMark }} point mark
        </Trans>
      );
    return t("analyzer;ldeNoEffectExplanation");
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
        color={grayWithShade}
        textTransform="uppercase"
        letterSpacing="wider"
        lineHeight="1rem"
        fontWeight="medium"
        mb={1}
      >
        {t("analyzer;Intensity")}
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
        <Box color={themeColorWithShade} fontWeight="bold" mt="1em">
          +{bonusAp}
          {t("analyzer;abilityPointShort")}{" "}
          {["ISM", "ISS", "REC"].map((ability) => (
            <Box as="span" mx="0.2em" key={ability}>
              <AbilityIcon ability={ability as any} size="SUBTINY" />
            </Box>
          ))}
        </Box>
      )}
      <Box
        color={grayWithShade}
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
