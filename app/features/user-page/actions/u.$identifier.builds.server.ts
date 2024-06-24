import type { ActionFunction } from "@remix-run/node";
import { z } from "zod";
import { requireUserId } from "~/features/auth/core/user.server";
import * as BuildRepository from "~/features/builds/BuildRepository.server";
import { refreshBuildsCacheByWeaponSplIds } from "~/features/builds/core/cached-builds.server";
import { logger } from "~/utils/logger";
import { parseRequestFormData, validate } from "~/utils/remix";
import { actualNumber, id } from "~/utils/zod";

const buildsActionSchema = z.object({
	buildToDeleteId: z.preprocess(actualNumber, id),
});

export const action: ActionFunction = async ({ request }) => {
	const user = await requireUserId(request);
	const data = await parseRequestFormData({
		request,
		schema: buildsActionSchema,
	});

	const usersBuilds = await BuildRepository.allByUserId({
		userId: user.id,
		showPrivate: true,
	});

	const buildToDelete = usersBuilds.find(
		(build) => build.id === data.buildToDeleteId,
	);

	validate(buildToDelete);

	await BuildRepository.deleteById(data.buildToDeleteId);

	try {
		refreshBuildsCacheByWeaponSplIds(
			buildToDelete.weapons.map((weapon) => weapon.weaponSplId),
		);
	} catch (error) {
		logger.warn("Error refreshing builds cache", error);
	}

	return null;
};
