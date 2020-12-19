import { Box, Center, Flex } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
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
  isMulti: false;
}

interface MultiSelectorProps extends SelectorProps {
  value?: string[];
  setValue: (value: string[]) => void;
  isMulti: true;
  maxMultiCount: number;
}

const SingleValue = (props: any) => {
  return (
    <components.SingleValue {...props}>
      <Flex alignItems="center">
        <Box mr="0.5em" mb="-5px">
          <WeaponImage size={32} name={props.data.value} />
        </Box>
        {props.data.label}
      </Flex>
    </components.SingleValue>
  );
};

const Option = (props: any) => {
  return (
    <components.Option {...props}>
      <Flex alignItems="center">
        <Box mr="0.5em">
          <WeaponImage size={32} name={props.value} />
        </Box>
        {props.label}
      </Flex>
    </components.Option>
  );
};

const WeaponSelector: React.FC<SingleSelectorProps | MultiSelectorProps> = (
  props
) => {
  const { i18n } = useLingui();

  const maxMultiCount = props.isMulti ? props.maxMultiCount : Infinity;

  return (
    <MySelect
      options={getWeaponArray().map((category) => ({
        label: i18n._(category.name),
        options: category.weapons.map((weapon) => ({
          value: weapon,
          label: getLabel(weapon),
        })),
      }))}
      value={getValue()}
      setValue={props.setValue}
      isClearable={!!props.isClearable}
      isSearchable
      isMulti={props.isMulti}
      menuIsOpen={!!props.menuIsOpen}
      components={{
        IndicatorSeparator: () => null,
        Option,
        SingleValue,
        NoOptionsMessage: () => (
          <Center p={4}>
            {isTooManyItems() ? (
              <Trans>Only {props} weapons allowed</Trans>
            ) : (
              <Trans>No results with this filter</Trans>
            )}
          </Center>
        ),
      }}
      autoFocus={!!props.autoFocus}
      isDisabled={!!props.isDisabled}
    />
  );

  function getValue() {
    if (typeof props.value === "string") {
      return { value: props.value, label: getLabel(props.value) };
    }

    if (Array.isArray(props.value)) {
      return props.value.map((singleValue) => ({
        value: singleValue,
        label: getLabel(singleValue),
      }));
    }

    return undefined;
  }

  function getLabel(value: string) {
    if (value === "RANDOM") return t`Random`;
    if (value === "RANDOM_GRIZZCO") return t`Random (Grizzco)`;

    return i18n._(value);
  }

  function getWeaponArray() {
    if (isTooManyItems()) return [];
    if (props.pool === "WITH_ALTS") return weaponsWithHeroCategorized;
    if (props.pool === "SALMON_RUN")
      return [
        { name: t`Salmon Run`, weapons: ["RANDOM", "RANDOM_GRIZZCO"] },
      ].concat(
        weaponsWithHeroCategorized.map((category) => ({
          ...category,
          weapons: category.weapons.filter((wpn) => salmonRunWeapons.has(wpn)),
        }))
      );

    return weaponsWithHeroCategorized.map((category) => ({
      ...category,
      weapons: category.weapons.filter(
        (wpn) => !wpn.includes("Hero") && !wpn.includes("Octo Shot")
      ),
    }));
  }

  function isTooManyItems() {
    return maxMultiCount && maxMultiCount <= (props.value ?? []).length;
  }
};

export default WeaponSelector;
