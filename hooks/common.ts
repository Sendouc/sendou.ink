// https://usehooks.com/useDebounce/

import { useColorMode } from "@chakra-ui/react";
import { User as PrismaUser } from "@prisma/client";
import { useSession } from "next-auth/client";
import { useEffect, useState } from "react";
import { theme } from "theme";

export function useDebounce(value: string, delay: number = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const useMyTheme = () => {
  const { colorMode } = useColorMode();

  return theme[colorMode];
};

export const useUser = (): [PrismaUser | undefined | null, boolean] => {
  // @ts-ignore
  return useSession();
};
