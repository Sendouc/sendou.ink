import { json, type LoaderArgs } from "@remix-run/node";
// import { useLoaderData } from "@remix-run/react";
import { Main } from "~/components/Main";
import { db } from "~/db";
import { notFoundIfFalsy } from "~/utils/remix";
import { userParamsSchema } from "../u.$identifier";

export const loader = ({ params }: LoaderArgs) => {
  const { identifier } = userParamsSchema.parse(params);
  const user = notFoundIfFalsy(db.users.findByIdentifier(identifier));

  const builds = db.builds.buildsByUserId(user.id);

  return json({ builds });
};

export default function UserBuildsPage() {
  // const data = useLoaderData<typeof loader>();

  // console.log({ data });

  return <Main>hey</Main>;
}
