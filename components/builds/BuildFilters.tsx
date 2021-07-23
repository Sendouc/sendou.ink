import {
  Box,
  Flex,
  Grid,
  IconButton,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { Ability, Mode } from "@prisma/client";
import AbilityIcon from "components/common/AbilityIcon";
import {
  UseBuildsByWeaponDispatch,
  UseBuildsByWeaponState,
} from "hooks/builds";
import { CSSVariables } from "utils/CSSVariables";
import { Fragment, useState } from "react";
import { FiTrash } from "react-icons/fi";
import { abilities, isMainAbility } from "utils/lists/abilities";
import { components } from "react-select";
import ModeImage from "components/common/ModeImage";
import MySelect from "components/common/MySelect";
import useSelectStyles from "hooks/useSelectStyles";

interface Props {
  filters: UseBuildsByWeaponState["filters"];
  dispatch: UseBuildsByWeaponDispatch;
}

const modeOptions = [
  {
    label: "All modes",
    value: "ALL",
  },
  {
    label: "Splat Zones",
    value: "SZ",
  },
  {
    label: "Tower Control",
    value: "TC",
  },
  {
    label: "Rainmaker",
    value: "RM",
  },
  {
    label: "Clam Blitz",
    value: "CB",
  },
  {
    label: "Turf War",
    value: "TW",
  },
] as const;

const abilitiesOptions = abilities.map((item) => {
  return { label: item.name, value: item.code };
});

const ModeOption = (props: any) => {
  return (
    <components.Option {...props}>
      <Flex alignItems="center">
        <Box mr="0.5em">
          {props.value !== "ALL" ? (
            <ModeImage size={20} mode={props.value} />
          ) : (
            <></>
          )}
        </Box>
        {props.label}
      </Flex>
    </components.Option>
  );
};

const AbilityOption = (props: any) => {
  return (
    <components.Option {...props}>
      <Flex alignItems="center">
        <Box mr="0.5em">
          <AbilityIcon ability={props.value} size="SUBTINY" />
        </Box>
        {props.label}
      </Flex>
    </components.Option>
  );
};

const ModeSingleValue = (props: any) => {
  return (
    <components.SingleValue {...props}>
      {props.data.value !== "ALL" ? (
        <Box mr="0.5em">
          <ModeImage size={20} mode={props.data.value} />
        </Box>
      ) : (
        <></>
      )}
      {props.data.label}
    </components.SingleValue>
  );
};

const BuildFilters: React.FC<Props> = ({ filters, dispatch }) => {
  const [mode, setMode] = useState<{ label: string; value: string }>(
    modeOptions[0]
  );

  const selectDefaultStyles = useSelectStyles();
  const selectStyles = {
    ...selectDefaultStyles,
    singleValue: (base: any) => ({
      ...base,
      padding: 0,
      borderRadius: 5,
      color: CSSVariables.textColor,
      fontSize: "0.875rem",
      display: "flex",
    }),
    option: (styles: any, { isFocused }: any) => {
      return {
        ...styles,
        backgroundColor: isFocused ? CSSVariables.themeColorOpaque : undefined,
        fontSize: "0.875rem",
        color: CSSVariables.textColor,
      };
    },
    control: (base: any) => ({
      ...base,
      borderColor: CSSVariables.borderColor,
      minHeight: 32,
      height: 32,
      background: "hsla(0, 0%, 0%, 0)",
    }),
    dropdownIndicator: (base: any) => ({
      ...base,
      padding: 4,
    }),
  };

  return (
    <>
      <Grid
        templateColumns="1fr 1fr 2fr 2fr"
        alignItems="center"
        justifyContent="center"
        placeItems="center"
        maxWidth={24}
        gridRowGap={4}
        mx="auto"
      >
        {filters.map((filter, index) => (
          <Fragment key={filter.ability}>
            <Box mb="-1.2rem" />
            <Box mb="-1.2rem" />
            <Box
              mb="-1.2rem"
              fontSize="sm"
              color={
                filter.abilityPoints &&
                filter.abilityPoints.min > filter.abilityPoints.max
                  ? "red.500"
                  : CSSVariables.themeGray
              }
              pr={2}
            >
              {isMainAbility(filter.ability) ? (
                <Trans>Included</Trans>
              ) : (
                <Trans>Min AP</Trans>
              )}
            </Box>
            <Box
              mb="-1.2rem"
              fontSize="sm"
              color={
                filter.abilityPoints &&
                filter.abilityPoints.min > filter.abilityPoints.max
                  ? "red.500"
                  : CSSVariables.themeGray
              }
            >
              {isMainAbility(filter.ability) ? (
                <Trans>Excluded</Trans>
              ) : (
                <Trans>Max AP</Trans>
              )}
            </Box>
            <IconButton
              icon={<FiTrash />}
              onClick={() => dispatch({ type: "REMOVE_FILTER", index })}
              aria-label="Remove filter"
              variant="ghost"
              isRound
            />
            <Box mx={2} mt={2}>
              <AbilityIcon ability={filter.ability} size="TINY" />
            </Box>
            {isMainAbility(filter.ability) ? (
              <>
                <Radio
                  isChecked={filter.hasAbility}
                  onClick={() =>
                    dispatch({
                      type: "SET_FILTER_HAS_ABILITY",
                      index,
                      hasAbility: true,
                    })
                  }
                  value="HAS_ABILITY"
                />
                <Radio
                  isChecked={!filter.hasAbility}
                  value="DOES_NOT_HAVE_ABILITY"
                  onClick={() =>
                    dispatch({
                      type: "SET_FILTER_HAS_ABILITY",
                      index,
                      hasAbility: false,
                    })
                  }
                />
              </>
            ) : (
              <>
                <NumberInput
                  size="sm"
                  m={2}
                  width={24}
                  min={0}
                  max={57}
                  value={filter.abilityPoints!.min}
                  onChange={(_, value) =>
                    dispatch({
                      type: "SET_FILTER_ABILITY_POINTS",
                      abilityPoints: { ...filter.abilityPoints!, min: value },
                      index,
                    })
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>

                <NumberInput
                  size="sm"
                  m={2}
                  width={24}
                  min={0}
                  max={57}
                  value={filter.abilityPoints!.max}
                  onChange={(_, value) =>
                    dispatch({
                      type: "SET_FILTER_ABILITY_POINTS",
                      abilityPoints: { ...filter.abilityPoints!, max: value },
                      index,
                    })
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </>
            )}
          </Fragment>
        ))}
      </Grid>
      <Flex
        mt={4}
        justify="space-between"
        align="center"
        flexDir={["column", "row"]}
      >
        <Box minW={200} m="2">
          <MySelect
            name="filter by ability"
            isMulti={false}
            value={{ label: "Filter by ability", value: "DEFAULT" }}
            options={abilitiesOptions.filter((option) => {
              return !filters.find(
                (filterElement) => filterElement.ability === option.value
              );
            })}
            setValue={(value) => {
              dispatch({
                type: "ADD_FILTER",
                ability: value as Ability,
              });
            }}
            components={{
              Option: AbilityOption,
            }}
            styles={selectStyles}
          />
        </Box>
        <Box minW={200} m="2">
          <MySelect
            name="filter by mode"
            isMulti={false}
            value={mode}
            options={modeOptions}
            setValue={(value) => {
              const mode = modeOptions.find((option) => option.value === value);
              if (mode) setMode(mode);
              dispatch({
                type: "SET_MODE_FILTER",
                modeFilter: value === "ALL" ? undefined : (value as Mode),
              });
            }}
            components={{
              Option: ModeOption,
              SingleValue: ModeSingleValue,
            }}
            styles={selectStyles}
          />
        </Box>
      </Flex>
    </>
  );
};

export default BuildFilters;
