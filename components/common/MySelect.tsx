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
  autoFocus?: boolean;
  components?: Partial<SelectComponents<OptionTypeBase, boolean>>;
  isClearable?: boolean;
  isMulti?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  isSearchable?: boolean;
  menuIsOpen?: boolean;
  hideMenuBeforeTyping?: boolean;
}

const DropdownIndicator = (props: any) => {
  const { textColor } = useMyTheme();
  return (
    <components.DropdownIndicator {...props}>
      <svg
        viewBox="0 0 24 24"
        focusable="false"
        className="chakra-icon css-rcci7d"
      >
        <path
          fill="currentColor"
          d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"
        ></path>
      </svg>
    </components.DropdownIndicator>
  );
};

const MySelect: React.FC<SelectProps> = ({
  options,
  components,
  value,
  setValue,
  isClearable = false,
  autoFocus = false,
  isMulti = false,
  isLoading = false,
  isDisabled = false,
  isSearchable = false,
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

export default MySelect;
