import { useColorMode } from "@chakra-ui/react";
import { useMyTheme } from "lib/useMyTheme";
import { useState } from "react";
import ReactSelect, {
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
        value: string;
      }>
    | GroupedOptionsType<{
        label: string;
        value: string;
      }>;
  width?: string;
  value: ValueType<OptionTypeBase, boolean>;
  setValue?: (value: any) => void;
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

const MySelect: React.FC<SelectProps> = ({
  options,
  components,
  value,
  setValue,
  isClearable,
  autoFocus,
  isMulti,
  isLoading,
  isDisabled,
  isSearchable,
  menuIsOpen,
  hideMenuBeforeTyping,
}) => {
  const { borderColor, themeColorHex, bgColor } = useMyTheme();
  const { colorMode } = useColorMode();
  const [inputValue, setInputValue] = useState("");

  const handleChange = (selectedOption: any) => {
    if (!setValue) return;
    if (!selectedOption) {
      setValue(null);
      return;
    }
    if (Array.isArray(selectedOption)) {
      setValue(selectedOption.map((obj) => obj.value));
    } else {
      setValue(selectedOption?.value);
    }
  };

  const getOptionColor = (focused: boolean) => {
    if (focused) return "black";

    return colorMode === "light" ? "black" : "white";
  };

  const menuIsOpenCheck = () => {
    if (menuIsOpen) return true;
    if (hideMenuBeforeTyping) {
      return !!(inputValue.length >= 3);
    }

    return undefined;
  };

  console.log({ borderColor });

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
          color: colorMode === "light" ? "black" : "white",
          display: "flex",
        }),
        input: (base) => ({
          ...base,
          color: colorMode === "light" ? "black" : "white",
        }),
        multiValue: (base) => ({
          ...base,
          background: themeColorHex,
          color: "black",
        }),
        option: (styles, { isFocused }) => {
          return {
            ...styles,
            backgroundColor: isFocused ? themeColorHex : undefined,
            color: getOptionColor(isFocused),
          };
        },
        menu: (styles) => ({ ...styles, zIndex: 999 }),
        control: (base) => ({
          ...base,
          borderColor,
          height: "2.5rem",
          background: "hsla(0, 0%, 0%, 0)",
        }),
      }}
    />
  );
};

export default MySelect;
