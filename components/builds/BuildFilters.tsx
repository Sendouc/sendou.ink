import { Box, Button, Flex, Select } from "@chakra-ui/core";
import { t, Trans } from "@lingui/macro";
import { Ability } from "@prisma/client";
import AbilityIcon from "components/common/AbilityIcon";
import {
  BuildFilterType,
  UseBuildsByWeaponDispatch,
  UseBuildsByWeaponState,
} from "hooks/builds";
import { abilities, isMainAbility } from "lib/lists/abilities";
import { abilityPoints } from "lib/lists/abilityPoints";

interface Props {
  filters: UseBuildsByWeaponState["filters"];
  dispatch: UseBuildsByWeaponDispatch;
}

const BuildFilters: React.FC<Props> = ({ filters, dispatch }) => {
  return (
    <>
      {filters.map((filter, index) => (
        <Flex key={filter.key} alignItems="center" justifyContent="center">
          <Select
            value={filter.ability}
            onChange={(e) =>
              dispatch({
                type: "SET_FILTER_ABILITY",
                index,
                ability: e.target.value as Ability,
              })
            }
            variant="flushed"
            size="sm"
            width={48}
            m={2}
          >
            {abilities.map((ability) => (
              <option key={ability.code} value={ability.code}>
                {ability.name}
              </option>
            ))}
          </Select>
          <Box mx={4}>
            <AbilityIcon ability={filter.ability} size="TINY" />
          </Box>
          {isMainAbility(filter.ability) ? (
            <Select
              value={filter.type}
              onChange={(e) =>
                dispatch({
                  type: "SET_FILTER_TYPE",
                  index,
                  filterType: e.target.value as BuildFilterType,
                })
              }
              variant="flushed"
              size="sm"
              width={32}
              m={2}
            >
              <option value="HAS">{t`Has`}</option>
              <option value="DOES_NOT_HAVE">{t`Doesn't have`}</option>
            </Select>
          ) : (
            <>
              <Select
                value={filter.type}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FILTER_TYPE",
                    index,
                    filterType: e.target.value as BuildFilterType,
                  })
                }
                variant="flushed"
                size="sm"
                width={32}
                m={2}
              >
                <option value="AT_LEAST">{t`At least`}</option>
                <option value="AT_MOST">{t`At most`}</option>
              </Select>
              <Select
                value={filter.abilityPoints}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FILTER_ABILITY_POINTS",
                    index,
                    abilityPoints: Number(e.target.value),
                  })
                }
                variant="flushed"
                size="sm"
                width={20}
                m={2}
              >
                {abilityPoints.map((apOption) => (
                  <option key={apOption} value={apOption}>
                    {apOption} AP
                  </option>
                ))}
              </Select>
            </>
          )}
        </Flex>
      ))}
      <Button onClick={() => dispatch({ type: "ADD_FILTER" })}>
        <Trans>Add filter</Trans>
      </Button>
    </>
  );
};

export default BuildFilters;
