import { Box, Flex } from "@chakra-ui/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Ability } from "../../types";
import { abilitiesGameOrder } from "../../utils/lists";
import AbilityIcon from "../builds/AbilityIcon";
import Label from "../elements/Label";

interface AbilityButtonsProps {
  onClick: (ability: Ability) => void;
}

const AbilityButtons: React.FC<AbilityButtonsProps> = ({ onClick }) => {
  const { t } = useTranslation();
  return (
    <>
      <Box my="1em" textAlign="center">
        <Label>{t("analyzer;Main only abilities (click to select)")}</Label>
      </Box>
      <Flex flexWrap="wrap" justifyContent="center" maxW="340px" mx="auto">
        {abilitiesGameOrder
          .slice(14, abilitiesGameOrder.length)
          .map((ability) => (
            <Box
              m="0.3em"
              key={ability}
              cursor="pointer"
              onClick={() => onClick(ability)}
            >
              <AbilityIcon ability={ability} size="SUB" />
            </Box>
          ))}
      </Flex>
      <Box my="1em" textAlign="center">
        <Label>{t("analyzer;Stackable abilities")}</Label>
      </Box>
      <Flex flexWrap="wrap" justifyContent="center" maxW="350px" mx="auto">
        {abilitiesGameOrder.slice(0, 14).map((ability) => (
          <Box
            m="0.3em"
            key={ability}
            cursor="pointer"
            onClick={() => onClick(ability)}
          >
            {ability === "OG" && <br />}
            <AbilityIcon ability={ability} size="SUB" />
          </Box>
        ))}
      </Flex>
    </>
  );
};

export default AbilityButtons;
