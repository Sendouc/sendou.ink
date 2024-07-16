import type { LoaderFunctionArgs } from "@remix-run/node";
import { organizationFromParams } from "../tournament-organization-utils.server";

export async function loader({ params }: LoaderFunctionArgs) {
	// xxx: perms

	return {
		organization: await organizationFromParams(params),
	};
}
