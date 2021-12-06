import { useMatches, useTransition } from "remix";
import { LoggedInUser } from ".";

export const useUser = () => {
  const [root] = useMatches();

  return root.data.user as LoggedInUser;
};

export const useBaseURL = () => {
  const [root] = useMatches();

  return root.data.baseURL as string;
};

export const useIsSubmitting = (method: "POST" | "DELETE") => {
  const transition = useTransition();

  return (
    transition.state !== "idle" && transition.submission?.method === method
  );
};
