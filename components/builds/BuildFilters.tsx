import { Box, Button, Flex, Select } from "@chakra-ui/core";
import { t, Trans } from "@lingui/macro";
import { Ability } from "@prisma/client";
import AbilityIcon from "components/common/AbilityIcon";
import { abilities, isMainAbility } from "lib/lists/abilities";
import { Dispatch, SetStateAction } from "react";

const abilityPointOptions = [
  0,
  3,
  6,
  9,
  10,
  12,
  13,
  15,
  16,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
  39,
  40,
  41,
  42,
  43,
  44,
  45,
  46,
  47,
  48,
  49,
  50,
  51,
  52,
  53,
  54,
  55,
  56,
  57,
];

interface Props {
  filters: BuildFilter[];
  setFilters: Dispatch<SetStateAction<BuildFilter[]>>;
}

interface BuildFilter {
  type: "AT_LEAST" | "AT_MOST" | "HAS" | "DOES_NOT_HAVE";
  abilityPoints: number;
  ability: Ability;
}

const BuildFilters: React.FC<Props> = ({ filters, setFilters }) => {
  return (
    <>
      {filters.map((filter, i) => (
        <Flex alignItems="center" justifyContent="center">
          <Select
            value={filter.ability}
            onChange={(e) => {
              const newFilters = [...filters];
              newFilters[i] = { ...filter, ability: e.target.value as Ability };

              setFilters(newFilters);
            }}
            variant="flushed"
            size="sm"
            width={48}
            m={2}
          >
            {abilities.map((ability) => (
              <option value={ability.code}>{ability.name}</option>
            ))}
          </Select>
          <Box mx={4}>
            <AbilityIcon ability={filter.ability} size="TINY" />
          </Box>
          {isMainAbility(filter.ability) ? (
            <Select variant="flushed" size="sm" width={32} m={2}>
              <option value="HAS">{t`Has`}</option>
              <option value="DOES_NOT_HAVE">{t`Doesn't have`}</option>
            </Select>
          ) : (
            <>
              <Select variant="flushed" size="sm" width={32} m={2}>
                <option value="AT_LEAST">{t`At least`}</option>
                <option value="AT_MOST">{t`At most`}</option>
              </Select>
              <Select variant="flushed" size="sm" width={20} m={2}>
                {abilityPointOptions.map((apOption) => (
                  <option value={apOption}>{apOption} AP</option>
                ))}
              </Select>
            </>
          )}
        </Flex>
      ))}
      <Button
        onClick={() =>
          setFilters([
            ...filters,
            { ability: "ISM", type: "AT_LEAST", abilityPoints: 12 },
          ])
        }
      >
        <Trans>Add filter</Trans>
      </Button>
    </>
  );
};

export default BuildFilters;
