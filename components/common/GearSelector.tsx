import { Box, Flex } from "@chakra-ui/react";
import { useLingui } from "@lingui/react";
import { gear } from "lib/lists/gear";
import { components } from "react-select";
import GearImage from "./GearImage";
import MySelect from "./MySelect";

interface WeaponSelectorProps {
  value?: string;
  setValue: (value: string) => void;
  slot: "head" | "clothing" | "shoes";
}

const GearSelector: React.FC<WeaponSelectorProps> = ({
  value,
  setValue,
  slot,
}) => {
  const { i18n } = useLingui();
  const singleOption = (props: any) => (
    <components.Option {...props}>
      <Flex alignItems="center" color={props.isFocused ? "black" : undefined}>
        <Box mr="0.5em">
          <GearImage mini englishName={props.value} />
        </Box>
        {props.label}
      </Flex>
    </components.Option>
  );

  return (
    <MySelect
      options={gear.map((category) => ({
        label: i18n._(category.brand),
        options: category[slot].map((gear) => ({
          value: gear,
          label: i18n._(gear),
        })),
      }))}
      value={value ? { value, label: i18n._(value) } : undefined}
      setValue={setValue}
      isClearable
      isSearchable
      components={{
        IndicatorSeparator: () => null,
        Option: singleOption,
      }}
      hideMenuBeforeTyping
    />
  );
};

export default GearSelector;
