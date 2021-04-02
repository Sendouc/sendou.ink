import { ChevronDownIcon } from "@chakra-ui/icons";
import { useMyTheme } from "hooks/common";
import { useState } from "react";
import ReactSelect, {
  components,
  GroupedOptionsType,
  OptionsType,
  OptionTypeBase,
  ValueType,
} from "react-select";
import { SelectComponents } from "react-select/src/components";
import {Box, Flex} from "@chakra-ui/react";
import ModeImage from "./ModeImage";

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
  setValue: (value: any) => void;
  components?: Partial<SelectComponents<OptionTypeBase, boolean>>;
  isDisabled?: boolean;
  menuIsOpen?: boolean;
  hideMenuBeforeTyping?: boolean;
}

const DropdownIndicator = (props: any) => {
  const { textColor } = useMyTheme();
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDownIcon fontSize="1.3rem" color={textColor} />
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
  setValue,
  isDisabled = false,
  menuIsOpen = false,
  hideMenuBeforeTyping,
}) => {
  const {
    borderColor,
    themeColorHex,
    bgColor,
    themeColorOpaque,
    textColor,
  } = useMyTheme();
  const [inputValue, setInputValue] = useState("");
  const [sel, setSel] = useState([]);

  const handleChange = (selectedOption: any) => {
    if (!selectedOption) {
      setSel([]);
      return;
    }
    const newSelectedOption = selectedOption.map((opt: { label: string, data: string}) => ({
      label: opt.label,
      data: opt.data,
      value: Math.random()
    }));
    setSel(newSelectedOption);
    setValue(newSelectedOption);
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
      value={sel}
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
          primary25: `${themeColorHex}`,
          primary: themeColorHex,
          neutral0: bgColor,
          neutral5: bgColor,
        },
      })}
      styles={{
        singleValue: (base) => ({
          ...base,
          padding: 5,
          borderRadius: 5,
          color: textColor,
          display: "flex",
        }),
        input: (base) => ({
          ...base,
          color: textColor,
        }),
        multiValue: (base) => ({
          ...base,
          background: themeColorHex,
          color: "black",
        }),
        option: (styles, { isFocused }) => {
          return {
            ...styles,
            backgroundColor: isFocused ? themeColorOpaque : undefined,
            color: textColor,
          };
        },
        menu: (styles) => ({ ...styles, zIndex: 999 }),
        control: (base) => ({
          ...base,
          borderColor,
          minHeight: "2.5rem",
          background: "hsla(0, 0%, 0%, 0)",
        }),
      }}
    />
  );
};

export default MultipleModeSelector;