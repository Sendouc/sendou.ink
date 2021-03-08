import { Box, Flex } from "@chakra-ui/react";
import { useLingui } from "@lingui/react";
import { components } from "react-select";
import { gear } from "utils/lists/gear";
import GearImage from "./GearImage";
import MySelect from "./MySelect";

interface WeaponSelectorProps {
  value?: string;
  setValue: (value: string) => void;
  slot: "head" | "clothing" | "shoes";
}

const SingleValue = (props: any) => {
  return (
    <components.SingleValue {...props}>
      <Flex alignItems="center">
        <Box mr="0.5em" mb="-5px">
          <GearImage mini englishName={props.data.value} />
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
          <GearImage mini englishName={props.value} />
        </Box>
        {props.label}
      </Flex>
    </components.Option>
  );
};

const GearSelector: React.FC<WeaponSelectorProps> = ({
  value,
  setValue,
  slot,
}) => {
  const { i18n } = useLingui();

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
        Option,
        SingleValue,
      }}
      hideMenuBeforeTyping
    />
  );
};

export default GearSelector;
