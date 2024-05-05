import { Main } from "~/components/Main";

import { loader } from "../loaders/lfg.server";
import { useLoaderData } from "@remix-run/react";
export { loader };

export default function LFGPage() {
  const data = useLoaderData<typeof loader>();

  console.log({ data });

  return <Main>Hello</Main>;
}
