import { CSSVariables } from "utils/CSSVariables";

const useSelectStyles = () => {
  return {
    singleValue: (base: any) => ({
      ...base,
      padding: 5,
      borderRadius: 5,
      color: CSSVariables.textColor,
      display: "flex",
    }),
    input: (base: any) => ({
      ...base,
      color: CSSVariables.textColor,
    }),
    multiValue: (base: any) => ({
      ...base,
      background: CSSVariables.themeColor,
      color: "black",
    }),
    option: (styles: any, { isFocused }: any) => {
      return {
        ...styles,
        backgroundColor: isFocused ? CSSVariables.themeColorOpaque : undefined,
        color: CSSVariables.textColor,
      };
    },
    menu: (styles: any) => ({ ...styles, zIndex: 999 }),
    control: (base: any) => ({
      ...base,
      borderColor: CSSVariables.borderColor,
      minHeight: "2.5rem",
      background: "hsla(0, 0%, 0%, 0)",
    }),
  };
};

export default useSelectStyles;
