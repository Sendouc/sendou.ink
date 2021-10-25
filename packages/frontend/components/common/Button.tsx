import { Button as MantineButton } from "@mantine/core";
import { ReactNode } from "react";

export function Button({
  children,
  icon,
}: {
  children: ReactNode;
  icon: ReactNode;
}) {
  return (
    <MantineButton radius="lg" rightIcon={icon}>
      {children}
    </MantineButton>
  );
}
