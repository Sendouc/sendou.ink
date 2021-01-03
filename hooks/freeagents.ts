import useUser from "lib/useUser";
import { GetAllFreeAgentPostsData } from "prisma/queries/getAllFreeAgentPosts";
import useSWR from "swr";

export function useFreeAgents() {
  const [user] = useUser();
  const { data } = useSWR<GetAllFreeAgentPostsData>("/api/freeagents");

  return {
    data: data ?? [],
    isLoading: !data,
    usersPost: data?.find((post) => post.user.discordId === user?.discordId),
  };
}
