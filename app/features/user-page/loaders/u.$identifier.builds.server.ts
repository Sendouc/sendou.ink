import type { LoaderFunctionArgs } from "@remix-run/node";
import { getUserId } from "~/features/auth/core/user.server";
import * as BuildRepository from "~/features/builds/BuildRepository.server";
import * as UserRepository from "~/features/user-page/UserRepository.server";
import type { MainWeaponId } from "~/modules/in-game-lists";
import { notFoundIfFalsy, privatelyCachedJson } from "~/utils/remix";
import { userParamsSchema } from "../user-page-schemas.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	const loggedInUser = await getUserId(request);
	const { identifier } = userParamsSchema.parse(params);
	const user = notFoundIfFalsy(
		await UserRepository.identifierToUserId(identifier),
	);

	const builds = await BuildRepository.allByUserId({
		userId: user.id,
		showPrivate: loggedInUser?.id === user.id,
	});

	if (builds.length === 0 && loggedInUser?.id !== user.id) {
		throw new Response(null, { status: 404 });
	}

	return privatelyCachedJson({
		builds,
		weaponCounts: calculateWeaponCounts(),
	});

	function calculateWeaponCounts() {
		return builds.reduce(
			(acc, build) => {
				for (const weapon of build.weapons) {
					acc[weapon.weaponSplId] = (acc[weapon.weaponSplId] ?? 0) + 1;
				}

				return acc;
			},
			{} as Record<MainWeaponId, number>,
		);
	}
};
