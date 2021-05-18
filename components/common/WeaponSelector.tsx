import { Box, Center, Flex } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { components } from "react-select";
import {
  salmonRunWeapons,
  weaponsWithHeroCategorized,
} from "utils/lists/weaponsWithHero";
import MySelect from "./MySelect";
import WeaponImage from "./WeaponImage";
import weaponJson from "utils/data/weaponData.json";

interface SelectorProps {
  autoFocus?: boolean;
  isClearable?: boolean;
  menuIsOpen?: boolean;
  isDisabled?: boolean;
  pool?: "WITH_ALTS" | "SALMON_RUN";
}

interface SingleSelectorProps extends SelectorProps {
  value?: string | null;
  setValue: (value: string) => void;
  isClearable?: true;
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

const customFilterOption = (option: any, rawInput: string) => {
  const words = rawInput.split(" ");
  return words.reduce(
    (acc, cur) => acc && (option.label.toLowerCase().includes(cur.toLowerCase()) ||
        option.data?.data?.sub.toLowerCase() === rawInput.toLowerCase() ||
        option.data?.data?.special.toLowerCase() === rawInput.toLowerCase()),
    true
  );
};

type WeaponData = {
  name: string;
  sub: string;
  special: string;
};

function initWeaponData() {
  const weaponData: Record<any, any> = weaponJson;
  const weaponsArray: WeaponData[] = [];

  for (const [key, value] of Object.entries(weaponData)) {
    if (value.Special && value.Sub) {
      weaponsArray.push({name: key, special: value.Special, sub: value.Sub});
    }
  }
  console.log('weaponsArray', weaponsArray);
  return weaponsArray;
}

const weaponData = initWeaponData();

const WeaponSelector: React.FC<SingleSelectorProps | MultiSelectorProps> = (
  props
) => {
  const { i18n } = useLingui();

  const maxMultiCount = props.isMulti ? props.maxMultiCount : Infinity;

  return (
    <MySelect
      name="weapon"
      options={getWeaponArray().map((category) => ({
        label: i18n._(category.name),
        options: category.weapons.map((weapon) => ({
          value: weapon,
          label: getLabel(weapon),
          data: weaponData.find(obj => {return obj.name === weapon})
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
              <Trans>Only {maxMultiCount} weapons allowed</Trans>
            ) : (
              <Trans>No results with this filter</Trans>
            )}
          </Center>
        ),
      }}
      autoFocus={!!props.autoFocus}
      isDisabled={!!props.isDisabled}
      customFilterOption={customFilterOption}
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
