import { Box, Center, Flex } from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import {
  salmonRunWeapons,
  weaponsWithHeroCategorized,
} from "lib/lists/weaponsWithHero";
import { components } from "react-select";
import MySelect from "./MySelect";
import WeaponImage from "./WeaponImage";

interface SelectorProps {
  autoFocus?: boolean;
  isClearable?: boolean;
  menuIsOpen?: boolean;
  isDisabled?: boolean;
  pool?: "WITH_ALTS" | "SALMON_RUN";
}

interface SingleSelectorProps extends SelectorProps {
  value?: string;
  setValue: (value: string) => void;
  isMulti: false | undefined;
  maxMultiCount: undefined;
}

interface MultiSelectorProps extends SelectorProps {
  value?: string[];
  setValue: (value: string[]) => void;
  isMulti: true;
  maxMultiCount: number;
}

const WeaponSelector: React.FC<SingleSelectorProps | MultiSelectorProps> = ({
  value,
  setValue,
  isClearable = false,
  autoFocus,
  isMulti,
  maxMultiCount,
  menuIsOpen,
  isDisabled,
  pool,
}) => {
  const { i18n } = useLingui();
  const singleOption = (props: any) => (
    <components.Option {...props}>
      <Flex alignItems="center">
        <Box mr="0.5em">
          <WeaponImage size={32} name={props.value} />
        </Box>
        {props.label}
      </Flex>
    </components.Option>
  );

  return (
    <MySelect
      options={getWeaponArray().map((category) => ({
        label: i18n._(category.name),
        options: category.weapons.map((weapon) => ({
          value: weapon,
          label: i18n._(weapon),
        })),
      }))}
      value={getValue()}
      setValue={setValue}
      isClearable={isClearable}
      isSearchable
      isMulti={isMulti}
      menuIsOpen={menuIsOpen}
      components={{
        IndicatorSeparator: () => null,
        Option: singleOption,
        NoOptionsMessage: () => (
          <Center p={4}>
            <>
              {isTooManyItems() ? (
                <Trans>Only {maxMultiCount} weapons allowed</Trans>
              ) : (
                <Trans>No results with this filter</Trans>
              )}
            </>
          </Center>
        ),
      }}
      autoFocus={autoFocus}
      isDisabled={isDisabled}
    />
  );

  function getValue() {
    if (typeof value === "string") {
      return { value, label: i18n._(value) };
    }

    if (Array.isArray(value)) {
      return value.map((singleValue) => ({
        value: singleValue,
        label: i18n._(singleValue),
      }));
    }

    return undefined;
  }

  function getWeaponArray() {
    if (isTooManyItems()) return [];
    if (pool === "WITH_ALTS") return weaponsWithHeroCategorized;
    if (pool === "SALMON_RUN")
      return weaponsWithHeroCategorized.map((category) => ({
        ...category,
        weapons: category.weapons.filter((wpn) => salmonRunWeapons.has(wpn)),
      }));

    return weaponsWithHeroCategorized.map((category) => ({
      ...category,
      weapons: category.weapons.filter(
        (wpn) => !wpn.includes("Hero") && !wpn.includes("Octo Shot")
      ),
    }));
  }

  function isTooManyItems() {
    return maxMultiCount && maxMultiCount <= (value ?? []).length;
  }
};

export default WeaponSelector;
