import { Main } from "~/components/Main";
import { useLoaderData } from "@remix-run/react";

import { loader } from "../loaders/lfg.server";
export { loader };

// xxx: +1/+2/+3 visibility

export default function LFGPage() {
  const data = useLoaderData<typeof loader>();

  console.log({ data });

  return <Main>Hello</Main>;
}
