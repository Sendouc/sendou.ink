import { Box, Button, Flex } from "@chakra-ui/react";
import { useDebounce } from "hooks/common";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { CSSVariables } from "utils/CSSVariables";
import { sendData } from "utils/postData";

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

const ProfileColorSelectors = ({
  hide,
  previousColors,
}: {
  hide: () => void;
  previousColors?: Record<string, string>;
}) => {
  const [currentColors, setCurrentColors] = useState<
    Record<string, string | undefined>
  >(previousColors ?? {});

  const debouncedCurrentColors = useDebounce(currentColors);

  const defaultColors = useMemo(() => {
    const bodyStyles = getComputedStyle(
      document.getElementsByTagName("body")[0]
    );

    const result: Record<string, string> = {};
    for (const themeValue of themeValues) {
      let value = previousColors?.[themeValue.name];
      if (!value) {
        value = bodyStyles.getPropertyValue(`--${themeValue.name}`).trim();
      }
      result[themeValue.name] = value;
    }

    return result;
  }, []);

  useEffect(() => {
    const body = document.getElementsByTagName("body")[0];

    for (const [key, value] of Object.entries(debouncedCurrentColors)) {
      body.style.setProperty(`--custom-${key}`, value ?? "");
      if (key === "theme-color") {
        body.style.setProperty(`--custom-${key}-opaque`, `${value}${20}` ?? "");
      }
    }
  }, [debouncedCurrentColors]);

  const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await sendData("POST", "/api/me/colors", {
      colors: currentColors,
    });

    if (success) {
      hide();
    }
  };

  return (
    <form onSubmit={onSubmitHandler}>
      <Flex flexWrap="wrap" justify="space-evenly" mt={4}>
        {themeValues.map((value) => {
          return (
            <Flex key={value.name} flexDir="column" align="center" mb={4}>
              <Box
                as="label"
                fontSize="sm"
                mb={2}
                fontWeight="bold"
                color={CSSVariables.themeGray}
                display="block"
                htmlFor={`${value.name}-input`}
              >
                {value.displayName}
              </Box>
              <input
                id={`${value.name}-input`}
                value={
                  debouncedCurrentColors[value.name] ??
                  defaultColors[value.name]
                }
                type="color"
                onChange={(e) =>
                  setCurrentColors((c) => ({
                    ...c,
                    [value.name]: e.target.value,
                  }))
                }
              />
              <Button
                onClick={() =>
                  setCurrentColors((c) => ({
                    ...c,
                    [value.name]: undefined,
                  }))
                }
                size="xs"
                colorScheme="red"
                mt={3}
              >
                Reset
              </Button>
            </Flex>
          );
        })}
      </Flex>
      <Flex justify="center">
        <Button type="submit" size="sm" variant="outline" mr={2}>
          Save
        </Button>
        <Button
          size="sm"
          variant="outline"
          ml={2}
          colorScheme="red"
          onClick={hide}
        >
          Cancel
        </Button>
      </Flex>
    </form>
  );
};

export default ProfileColorSelectors;
