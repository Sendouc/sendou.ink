import type { LoaderFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { notFoundIfFalsy, parseParams } from "~/utils/remix";
import * as TournamentOrganizationRepository from "../TournamentOrganizationRepository.server";

export async function loader({ params }: LoaderFunctionArgs) {
	const { slug } = parseParams({ params, schema: paramsSchema });
	const organization = notFoundIfFalsy(
		await TournamentOrganizationRepository.findBySlug(slug),
	);

	return { organization };
}

const paramsSchema = z.object({
	slug: z.string(),
});
