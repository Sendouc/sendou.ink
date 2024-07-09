import { useLoaderData } from "@remix-run/react";
import { Main } from "~/components/Main";

import { loader } from "../loaders/org.$slug.server";
export { loader };

export default function TournamentOrganizationPage() {
	const data = useLoaderData<typeof loader>();

	return <Main>{data.organization.name}</Main>;
}