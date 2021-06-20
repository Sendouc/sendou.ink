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
import useSelectStyles from "hooks/useSelectStyles";

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
  name?: string;
  width?: string;
  value?: ValueType<OptionTypeBase, boolean>;
  setValue: (value: any) => void;
  autoFocus?: boolean;
  components?: Partial<SelectComponents<OptionTypeBase, boolean>>;
  isClearable?: boolean;
  isMulti?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  isSearchable?: boolean;
  menuIsOpen?: boolean;
  hideMenuBeforeTyping?: boolean;
  customFilterOption?: (option: any, rawInput: string) => boolean;
  styles?: any;
}

const DropdownIndicator = (props: any) => {
  const { textColor } = useMyTheme();
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDownIcon fontSize="1.3rem" color={textColor} />
    </components.DropdownIndicator>
  );
};

const MySelect: React.FC<SelectProps> = ({
  options,
  components,
  value,
  setValue,
  name,
  isClearable = false,
  autoFocus = false,
  isMulti = false,
  isLoading = false,
  isDisabled = false,
  isSearchable = false,
  menuIsOpen = false,
  hideMenuBeforeTyping,
  customFilterOption,
  styles,
}) => {
  const { themeColorHex, bgColor } = useMyTheme();
  const [inputValue, setInputValue] = useState("");
  const selectDefaultStyles = useSelectStyles();

  const handleChange = (selectedOption: any) => {
    if (!selectedOption) {
      setValue(isMulti ? [] : null);
      return;
    }
    if (Array.isArray(selectedOption)) {
      setValue(selectedOption.map((obj) => obj.value));
    } else {
      setValue(selectedOption?.value);
    }
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
      name={name}
      value={value}
      inputValue={inputValue}
      onInputChange={(newValue) => setInputValue(newValue)}
      menuIsOpen={menuIsOpenCheck()}
      onChange={handleChange}
      placeholder={null}
      isSearchable={!!isSearchable}
      isMulti={!!isMulti}
      isLoading={isLoading}
      isDisabled={isDisabled}
      isClearable={isClearable}
      options={options}
      filterOption={customFilterOption}
      components={
        hideMenuBeforeTyping
          ? {
              IndicatorSeparator: () => null,
              DropdownIndicator: () => null,
              ...components,
            }
          : {
              IndicatorSeparator: () => null,
              DropdownIndicator,
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
      autoFocus={autoFocus}
      styles={styles ? styles : selectDefaultStyles}
    />
  );
};

export default MySelect;
