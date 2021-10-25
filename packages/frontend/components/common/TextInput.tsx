import { TextInput as MantineTextInput } from "@mantine/core";
import { createStyles, MantineSize } from "@mantine/styles";
import { ReactNode } from "react";

const useStyles = createStyles(() => ({
  input: {
    backgroundColor: "var(--colors-bg-lighter)",
    color: "var(--colors-text)",
    fontWeight: 500,
    fontSize: "0.9rem",
    "::placeholder": {
      color: "var(--colors-text-lighter)",
    },
  },
}));

export function TextInput({
  placeholder,
  icon,
  size,
}: {
  placeholder: string;
  icon?: ReactNode;
  size?: MantineSize;
}) {
  const { classes } = useStyles();
  return (
    <MantineTextInput
      placeholder={placeholder}
      rightSection={icon}
      size={size}
      radius="lg"
      classNames={{
        input: classes.input,
      }}
    />
  );
}
