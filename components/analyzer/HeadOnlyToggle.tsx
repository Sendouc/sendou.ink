import { Box, Flex, FormLabel, Switch } from "@chakra-ui/react";
import { t } from "@lingui/macro";
import AbilityIcon from "components/common/AbilityIcon";
import { CSSVariables } from "utils/CSSVariables";
import React from "react";

interface HeadOnlyToggleProps {
  ability: "OG" | "CB" | "DR";
  active: boolean;
  setActive: () => void;
}

const HeadOnlyToggle: React.FC<HeadOnlyToggleProps> = ({
  ability,
  active,
  setActive,
}) => {
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      mb="1em"
    >
      <Box>
        <Switch
          id="show-all"
          color={CSSVariables.themeColor}
          isChecked={active}
          onChange={() => setActive()}
          mr="0.5em"
          mb={4}
        />
        <FormLabel htmlFor="show-all">
          <AbilityIcon ability={ability} size="TINY" />
        </FormLabel>
      </Box>
      {active && ability === "OG" && (
        <Box color={CSSVariables.themeColor} fontWeight="bold">
          +30{t`AP`}{" "}
          {["SSU", "RSU", "RES"].map((ability) => (
            <Box as="span" mx="0.2em" key={ability}>
              <AbilityIcon ability={ability as any} size="SUBTINY" />
            </Box>
          ))}
        </Box>
      )}
      {active && ability === "CB" && (
        <Box color={CSSVariables.themeColor} fontWeight="bold">
          +10{t`AP`}{" "}
          {["ISM", "ISS", "REC", "RSU", "SSU", "SCU"].map((ability) => (
            <Box as="span" mx="0.2em" key={ability}>
              <AbilityIcon ability={ability as any} size="SUBTINY" />
            </Box>
          ))}
        </Box>
      )}
      {active && ability === "DR" && (
        <Box color={CSSVariables.themeColor} fontWeight="bold">
          +10{t`AP`}{" "}
          {["RSU", "SSU", "RES"].map((ability) => (
            <Box as="span" mx="0.2em" key={ability}>
              <AbilityIcon ability={ability as any} size="SUBTINY" />
            </Box>
          ))}
        </Box>
      )}
    </Flex>
  );
};

export default HeadOnlyToggle;
