import { useToast } from "@chakra-ui/react";
import { User as PrismaUser } from "@prisma/client";
import { useSession } from "next-auth/client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { navItems } from "utils/constants";
import { getToastOptions } from "utils/objects";

// https://usehooks.com/useDebounce/
export function useDebounce<T>(value: T, delay: number = 500) {
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

export const useUser = (): [PrismaUser | undefined | null, boolean] => {
  // @ts-ignore
  return useSession();
};

export const useActiveNavItem = () => {
  const [navItem, setNavItem] = useState<
    undefined | { code: string; name: string; imageSrc?: string }
  >(undefined);
  const router = useRouter();
  const firstPath = router.pathname.split("/")[1];

  useEffect(() => {
    setNavItem(navItems.find(({ code }) => code === firstPath));
  }, [firstPath]);

  return navItem;
};

export const useMutation = <T>({
  url,
  method = "POST",
  data,
  successToastMsg,
  afterSuccess,
}: {
  url: string;
  method?: "POST" | "DELETE" | "PUT";
  data?: T;
  successToastMsg: string;
  afterSuccess?: () => void;
}) => {
  const toast = useToast();
  const [isMutating, setIsMutating] = useState(false);
  const mutate = async (parameterData?: T) => {
    setIsMutating(true);
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parameterData ?? data),
    });
    setIsMutating(false);

    if (response.status < 200 || response.status > 299) {
      let description = "An error occurred";
      try {
        const error = await response.json();
        if (error.message) {
          description = error.message;
          console.error(error.message);
        }
      } catch {}

      toast({
        duration: null,
        isClosable: true,
        position: "top-right",
        status: "error",
        description,
      });
    } else {
      toast(getToastOptions(successToastMsg, "success"));
      afterSuccess?.();
    }
  };

  return { mutate, isMutating };
};
