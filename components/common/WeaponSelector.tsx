import { Box, Flex } from "@chakra-ui/react";
import { useLingui } from "@lingui/react";
import { weaponsWithHeroCategorized } from "lib/lists/weaponsWithHero";
import { components } from "react-select";
import MySelect from "./MySelect";
import WeaponImage from "./WeaponImage";

interface WeaponSelectorProps {
  value?: string;
  setValue: (value: string) => void;
  autoFocus?: boolean;
  isClearable?: boolean;
  isMulti?: boolean;
  menuIsOpen?: boolean;
  showAlts?: boolean;
}

const WeaponSelector: React.FC<WeaponSelectorProps> = ({
  value,
  setValue,
  isClearable,
  autoFocus,
  isMulti,
  menuIsOpen,
  showAlts,
}) => {
  const { i18n } = useLingui();
  const singleOption = (props: any) => (
    <components.Option {...props}>
      <Flex alignItems="center" color={props.isFocused ? "black" : undefined}>
        <Box mr="0.5em">
          <WeaponImage size={32} name={props.value} />
        </Box>
        {props.label}
      </Flex>
    </components.Option>
  );

  return (
    <MySelect
      options={
        showAlts
          ? weaponsWithHeroCategorized.map((category) => ({
              label: i18n._(category.name),
              options: category.weapons.map((weapon) => ({
                value: weapon,
                label: i18n._(weapon),
              })),
            }))
          : weaponsWithHeroCategorized.map((category) => ({
              label: i18n._(category.name),
              options: category.weapons
                .filter(
                  (wpn) => !wpn.includes("Hero") && !wpn.includes("Octo Shot")
                )
                .map((weapon) => ({
                  value: weapon,
                  label: i18n._(weapon),
                })),
            }))
      }
      value={value ? { value, label: i18n._(value) } : undefined}
      setValue={setValue}
      isClearable={isClearable}
      isSearchable
      isMulti={isMulti}
      menuIsOpen={menuIsOpen}
      components={{
        IndicatorSeparator: () => null,
        Option: singleOption,
      }}
      autoFocus={autoFocus}
    />
  );
};

export default WeaponSelector;
