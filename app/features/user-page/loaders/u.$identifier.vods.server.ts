import type { LoaderFunctionArgs } from "@remix-run/node";
import * as UserRepository from "~/features/user-page/UserRepository.server";
import { findVods } from "~/features/vods/queries/findVods.server";
import { notFoundIfFalsy } from "~/utils/remix";

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const userId = notFoundIfFalsy(
		await UserRepository.identifierToUserId(params.identifier!),
	).id;

	return {
		vods: findVods({ userId }),
	};
};
