import { useToast } from "@chakra-ui/react";
import { getToastOptions } from "lib/getToastOptions";
import { sendData } from "lib/postData";
import { useState } from "react";
import { mutate } from "swr";
import { useUser } from "./common";

const useMutation = ({
  route,
  mutationKey,
  onClose,
  successText,
}: {
  route: string;
  mutationKey: string;
  onClose: () => void;
  successText: string;
}) => {
  const toast = useToast();
  const [sending, setSending] = useState(false);
  const [loggedInUser] = useUser();

  const onSubmit = async (formData: object) => {
    if (!loggedInUser) {
      console.error("Unexpected no logged in user");
      return;
    }
    setSending(true);
    const mutationData = { ...formData };

    for (const [key, value] of Object.entries(mutationData)) {
      if (value === "" || value === undefined) {
        // @ts-ignore
        mutationData[key] = null;
      }
    }

    const success = await sendData("POST", "/api/" + route, mutationData);
    setSending(false);
    if (!success) return;

    mutate("/api/" + mutationKey);

    toast(getToastOptions(successText, "success"));
    onClose();
  };

  return { onSubmit, sending };
};

export default useMutation;
