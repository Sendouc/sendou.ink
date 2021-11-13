import { useData } from "solid-app-router";
import { createResource } from "solid-js";
import { trpcClient } from "../../../utils/trpc";

function fetchHello(input: string) {
  return trpcClient.query("hello", input);
}

export default function HelloData({
  params,
}: {
  params: { identifier: string };
}) {
  const [user] = createResource(() => params.identifier, fetchHello);

  return user;
}

export const useHelloData = () => useData<() => string>();
