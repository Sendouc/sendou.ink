import { ChevronDownIcon } from "@chakra-ui/icons";
import { CSSVariables } from "utils/CSSVariables";
import { useState } from "react";
import ReactSelect, {
  components,
  GroupedOptionsType,
  OptionsType,
  OptionTypeBase,
  ValueType,
} from "react-select";
import { SelectComponents } from "react-select/src/components";
import { Box, Flex } from "@chakra-ui/react";
import ModeImage from "./ModeImage";
import { selectDefaultStyles } from "./MySelect";

interface SelectProps {
  options?:
    | OptionsType<{
        label: string;
        value: any;
        data?: any;
      }>
    | GroupedOptionsType<{
        label: string;
        value: string;
        data?: any;
      }>;
  width?: string;
  value?: ValueType<OptionTypeBase, boolean>;
  updateMapsModes: (value: any) => void;
  defaultValue?: OptionsType<{
    label: string;
    value: any;
    data?: any;
  }>;
  components?: Partial<SelectComponents<OptionTypeBase, boolean>>;
  isDisabled?: boolean;
  menuIsOpen?: boolean;
  hideMenuBeforeTyping?: boolean;
}

const DropdownIndicator = (props: any) => {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDownIcon fontSize="1.3rem" color={CSSVariables.textColor} />
    </components.DropdownIndicator>
  );
};

const Option = (props: any) => {
  return (
    <components.Option {...props}>
      <Flex alignItems="center">
        <Box mr="0.5em">
          <ModeImage size={24} mode={props.value} />
        </Box>
        {props.label}
      </Flex>
    </components.Option>
  );
};

const MultipleModeSelector: React.FC<SelectProps> = ({
  options,
  components,
  updateMapsModes,
  isDisabled = false,
  menuIsOpen = false,
  hideMenuBeforeTyping,
  defaultValue,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [selectedModes, setSelectedModes] = useState(defaultValue);

  const handleChange = (selectedOption: any) => {
    if (!selectedOption) {
      setSelectedModes([]);
      return;
    }
    const newSelectedOption = selectedOption.map(
      (opt: { label: string; data: string }) => ({
        label: opt.label,
        data: opt.data,
        value: Math.random(),
      })
    );
    setSelectedModes(newSelectedOption);
    updateMapsModes(newSelectedOption);
  };

  const menuIsOpenCheck = () => {
    if (menuIsOpen) return true;
    if (hideMenuBeforeTyping) {
      return !!(inputValue.length >= 3);
    }

    return undefined;
  };

  return (
    <ReactSelect
      className="basic-single"
      classNamePrefix="select"
      value={selectedModes}
      inputValue={inputValue}
      onInputChange={(newValue) => setInputValue(newValue)}
      menuIsOpen={menuIsOpenCheck()}
      onChange={handleChange}
      placeholder={null}
      isMulti={true}
      isDisabled={isDisabled}
      isClearable={true}
      options={options}
      components={
        hideMenuBeforeTyping
          ? {
              IndicatorSeparator: () => null,
              DropdownIndicator: () => null,
              Option,
              ...components,
            }
          : {
              IndicatorSeparator: () => null,
              DropdownIndicator,
              Option,
              ...components,
            }
      }
      theme={(theme) => ({
        ...theme,
        borderRadius: 5,
        colors: {
          ...theme.colors,
          primary25: `${CSSVariables.themeColor}`,
          primary: CSSVariables.themeColor,
          neutral0: CSSVariables.bgColor,
          neutral5: CSSVariables.bgColor,
        },
      })}
      styles={selectDefaultStyles}
    />
  );
};

export default MultipleModeSelector;
