import { createStandaloneToast } from "@chakra-ui/react";
import { t } from "@lingui/macro";

export async function sendData(method = "POST", url = "", data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (response.status < 200 || response.status > 299) {
    const toast = createStandaloneToast();

    toast({
      duration: null,
      isClosable: true,
      position: "top-right",
      status: "error",
      description: t`An error occurred`,
    });

    return false;
  }

  return true;
}
