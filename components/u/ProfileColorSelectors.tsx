import { Box, Flex } from "@chakra-ui/react";
import { useDebounce } from "hooks/common";
import { useEffect, useState } from "react";
import { CSSVariables } from "utils/CSSVariables";

/*
  --theme-color: #79ff61;
  --theme-color-opaque: hsla(111, 100%, 69%, 0.1);
  --theme-gray: var(--chakra-colors-gray-300);
  --bg-color: #031e3e;
  --secondary-bg-color: #0e2a56;
  --text-color: var(--chakra-colors-whiteAlpha-900);
  --border-color: #2e466c;
*/

const themeValues: { name: string; displayName: string }[] = [
  {
    name: "theme-color",
    displayName: "Theme",
  },
  {
    name: "theme-gray",
    displayName: "Theme Secondary",
  },
  {
    name: "bg-color",
    displayName: "Background",
  },
  {
    name: "secondary-bg-color",
    displayName: "Secondary Background",
  },
  {
    name: "text-color",
    displayName: "Text",
  },
];

const ProfileColorSelectors = () => {
  const [currentColors, setCurrentColors] = useState<Record<string, string>>(
    {}
  );

  const debouncedCurrentColors = useDebounce(currentColors);

  useEffect(() => {
    const bodyStyles = getComputedStyle(
      document.getElementsByTagName("body")[0]
    );

    const result: Record<string, string> = {};
    for (const themeValue of themeValues) {
      // TODO: source this otherwise
      let value = bodyStyles
        .getPropertyValue(`--custom-${themeValue.name}`)
        .trim();
      if (!value) {
        value = bodyStyles.getPropertyValue(`--base-${themeValue.name}`).trim();
      }
      result[themeValue.name] = value;
    }

    setCurrentColors(result);
  }, []);

  useEffect(() => {
    const body = document.getElementsByTagName("body")[0];

    for (const [key, value] of Object.entries(debouncedCurrentColors)) {
      body.style.setProperty(`--custom-${key}`, value);
    }
  }, [debouncedCurrentColors]);

  return (
    <Flex flexWrap="wrap" justify="space-evenly">
      {themeValues.map((value) => {
        return (
          <Box key={value.name}>
            <Box
              as="label"
              fontSize="sm"
              fontWeight="bold"
              color={CSSVariables.themeGray}
              display="block"
              htmlFor={`${value.name}-input`}
            >
              {value.displayName}
            </Box>
            <input
              id={`${value.name}-input`}
              value={debouncedCurrentColors[value.name] || "#000000"}
              type="color"
              onChange={(e) =>
                setCurrentColors((c) => ({
                  ...c,
                  [value.name]: e.target.value,
                }))
              }
            />
          </Box>
        );
      })}
    </Flex>
  );
};

export default ProfileColorSelectors;
