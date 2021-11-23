import {
  createContext,
  useContext,
  createResource,
  JSXElement,
  Resource,
} from "solid-js";
import { trpcClient } from "./trpc-client";

const fetchLoggedInUser = async () => {
  return trpcClient.query("layout.getLoggedInUser");
};

type LoggedInUserResource = Resource<
  | {
      id: number;
      discordId: string;
      discordAvatar?: string | undefined;
    }
  | undefined
>;

const UserContext = createContext<LoggedInUserResource>();

export function UserProvider(props: { children: JSXElement }) {
  const [user] = createResource(fetchLoggedInUser);

  return (
    <UserContext.Provider value={user}>{props.children}</UserContext.Provider>
  );
}

export function useUser(): LoggedInUserResource {
  return useContext(UserContext)!;
}
