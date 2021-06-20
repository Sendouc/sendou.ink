import { useMyTheme } from "./common";

const useSelectStyles = () => {
  const { borderColor, themeColorHex, themeColorOpaque, textColor } =
    useMyTheme();

  return {
    singleValue: (base: any) => ({
      ...base,
      padding: 5,
      borderRadius: 5,
      color: textColor,
      display: "flex",
    }),
    input: (base: any) => ({
      ...base,
      color: textColor,
    }),
    multiValue: (base: any) => ({
      ...base,
      background: themeColorHex,
      color: "black",
    }),
    option: (styles: any, { isFocused }: any) => {
      return {
        ...styles,
        backgroundColor: isFocused ? themeColorOpaque : undefined,
        color: textColor,
      };
    },
    menu: (styles: any) => ({ ...styles, zIndex: 999 }),
    control: (base: any) => ({
      ...base,
      borderColor,
      minHeight: "2.5rem",
      background: "hsla(0, 0%, 0%, 0)",
    }),
  };
};

export default useSelectStyles;
