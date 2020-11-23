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

    let description = t`An error occurred`;
    try {
      const error = await response.json();
      if (error.message) description = error.message;
    } catch {}

    toast({
      duration: null,
      isClosable: true,
      position: "top-right",
      status: "error",
      description,
    });

    return false;
  }

  return true;
}
