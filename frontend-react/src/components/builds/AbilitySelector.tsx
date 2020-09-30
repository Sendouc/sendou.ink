import React, { useState } from "react";
import FieldsetWithLegend from "../common/FieldsetWithLegend";
import { Flex, Box } from "@chakra-ui/core";
import { abilitiesGameOrder } from "../../utils/lists";
import AbilityIcon from "./AbilityIcon";
import { Ability } from "../../types";
import Button from "../elements/Button";
import { FaFilter } from "react-icons/fa";
import { useTranslation } from "react-i18next";

interface AbilitySelectorProps {
  abilities: Ability[];
  setAbilities: (abilities: Ability[]) => void;
}

const AbilitySelector: React.FC<AbilitySelectorProps> = ({
  abilities,
  setAbilities,
}) => {
  const [show, setShow] = useState(false);
  const { t } = useTranslation();
  return show ? (
    <>
      <FieldsetWithLegend
        title={t("builds;Click an ability to filter by it")}
        titleFontSize="md"
        centerTitle
        dividerMode
        mt="1em"
      >
        <Flex flexWrap="wrap" justifyContent="center">
          {abilitiesGameOrder.map((ability) => (
            <Box
              key={ability}
              p="5px"
              cursor={abilities.indexOf(ability) === -1 ? "pointer" : undefined}
              onClick={() => {
                if (abilities.indexOf(ability) !== -1) return;
                setAbilities(abilities.concat(ability));
              }}
            >
              <AbilityIcon
                ability={abilities.indexOf(ability) === -1 ? ability : "EMPTY"}
                size="SUB"
              />{" "}
            </Box>
          ))}
        </Flex>
      </FieldsetWithLegend>
      {abilities.length > 0 && (
        <Box textAlign="center" width="100%">
          <FieldsetWithLegend
            title={t(
              "builds;Only showing builds featuring the following abilities"
            )}
            titleFontSize="md"
            centerTitle
            fullWidth
          >
            <Flex flexWrap="wrap" justifyContent="center">
              {abilities.map((ability) => (
                <Box
                  key={ability}
                  cursor="pointer"
                  p="5px"
                  onClick={() =>
                    setAbilities(
                      abilities.filter(
                        (abilityInArray) => ability !== abilityInArray
                      )
                    )
                  }
                >
                  <AbilityIcon ability={ability} size="SUB" />{" "}
                </Box>
              ))}
            </Flex>
          </FieldsetWithLegend>
        </Box>
      )}
    </>
  ) : (
    <Button icon={<FaFilter />} onClick={() => setShow(!show)}>
      {t("builds;Filter by ability")}
    </Button>
  );
};

export default AbilitySelector;
