import { suite } from "uvu";
import * as assert from "uvu/assert";
import type { MainWeaponId } from "~/modules/in-game-lists";
import { databaseTimestampNow } from "~/utils/dates";
import { sortBuilds } from "./build-sorting.server";

const BuildSorting = suite("sortBuilds()");

type BuildSortingBuildArg = Parameters<
	typeof sortBuilds
>[number]["builds"][number];
const mockBuild = (
	partialBuild: Partial<BuildSortingBuildArg>,
): BuildSortingBuildArg => {
	return {
		id: 0,
		abilities: [
			["ISM", "ISM", "ISM", "ISM"],
			["ISM", "ISM", "ISM", "ISM"],
			["ISM", "ISM", "ISM", "ISM"],
		],
		headGearSplId: 0,
		clothesGearSplId: 0,
		shoesGearSplId: 0,
		description: null,
		modes: ["SZ"],
		private: 0,
		title: "",
		updatedAt: databaseTimestampNow(),
		weapons: [{ weaponSplId: 0, maxPower: null, minRank: null }],
		...partialBuild,
	};
};

BuildSorting("sorts by UPDATED_AT", () => {
	const builds = [
		mockBuild({ id: 1, updatedAt: 1 }),
		mockBuild({ id: 2, updatedAt: 3 }),
		mockBuild({ id: 3, updatedAt: 2 }),
	];

	const sortedBuilds = sortBuilds({
		builds,
		buildSorting: ["UPDATED_AT"],
		weaponPool: [],
	});

	assert.equal(sortedBuilds[0].id, 2);
	assert.equal(sortedBuilds[1].id, 3);
});

BuildSorting("sorts by TOP_500", () => {
	const builds = [
		mockBuild({ id: 1 }),
		mockBuild({
			id: 2,
			weapons: [{ weaponSplId: 1, maxPower: 3000, minRank: 1 }],
		}),
		mockBuild({
			id: 3,
			weapons: [
				{ weaponSplId: 0, maxPower: null, minRank: null },
				{ weaponSplId: 1, maxPower: 2900, minRank: 1 },
			],
		}),
	];

	const sortedBuilds = sortBuilds({
		builds,
		buildSorting: ["TOP_500"],
		weaponPool: [],
	});

	// highest XP first
	assert.equal(sortedBuilds[0].id, 2);
	assert.equal(sortedBuilds[1].id, 3);
});

BuildSorting("sorts by WEAPON_POOL", () => {
	const builds = [
		mockBuild({
			id: 1,
			weapons: [{ weaponSplId: 1000, maxPower: null, minRank: null }],
		}),
		mockBuild({
			id: 2,
			weapons: [{ weaponSplId: 10, maxPower: null, minRank: null }],
		}),
		mockBuild({
			id: 3,
			weapons: [{ weaponSplId: 1, maxPower: null, minRank: null }],
		}),
	];

	const sortedBuilds = sortBuilds({
		builds,
		buildSorting: ["WEAPON_POOL"],
		weaponPool: [1, 10],
	});

	assert.equal(sortedBuilds[0].id, 3);
	assert.equal(sortedBuilds[1].id, 2);
});

BuildSorting("sorts by WEAPON_POOL (alt kits are same priority)", () => {
	const mockBuildBuilder = (
		id: number,
		weaponIds: MainWeaponId[],
	): BuildSortingBuildArg => {
		return mockBuild({
			id,
			weapons: weaponIds.map((wepId) => ({
				weaponSplId: wepId,
				maxPower: null,
				minRank: null,
			})),
		});
	};

	const builds1 = [
		[1, [1000]],
		[2, [10]],
		[3, [0]],
		[4, [11]],
		[5, [1]],
	].map(([id, weaponIds]) =>
		mockBuildBuilder(id as number, weaponIds as MainWeaponId[]),
	);

	const sortedBuilds1 = sortBuilds({
		builds: builds1,
		buildSorting: ["WEAPON_POOL"],
		weaponPool: [1, 10],
	});

	// Sorting is stable; should keep relative order of alt kits
	// and relative order of non-weapon pool kits
	let expected = [3, 5, 2, 4, 1];
	for (const [idx, expectedVal] of expected.entries()) {
		assert.equal(sortedBuilds1[idx].id, expectedVal);
	}

	const builds2 = [
		[1, [1000]],
		[2, [0, 10, 1011]],
		[3, [2]],
		[4, [2010, 40]],
		[5, [8001, 8000]],
		[6, [8020, 201, 8021]],
		[7, [5010, 46, 50]],
	].map(([id, weaponIds]) =>
		mockBuildBuilder(id as number, weaponIds as MainWeaponId[]),
	);

	const sortedBuilds2 = sortBuilds({
		builds: builds2,
		buildSorting: ["WEAPON_POOL"],
		weaponPool: [47, 205, 1015],
	});

	// Using alt kit ids still acts as the vanilla kit id
	// Last 3 builds are not any variant of weapon pool weapons;
	// relative order is still preserved
	expected = [4, 7, 6, 2, 1, 3, 5];
	for (const [idx, expectedVal] of expected.entries()) {
		assert.equal(sortedBuilds2[idx].id, expectedVal);
	}
});

BuildSorting("sorts by ALPHABETICAL_TITLE", () => {
	const builds = [
		mockBuild({
			id: 1,
			title: "C",
		}),
		mockBuild({
			id: 2,
			title: "B",
		}),
		mockBuild({
			id: 3,
			title: "A",
		}),
	];

	const sortedBuilds = sortBuilds({
		builds,
		buildSorting: ["ALPHABETICAL_TITLE"],
		weaponPool: [],
	});

	assert.equal(sortedBuilds[0].id, 3);
	assert.equal(sortedBuilds[1].id, 2);
});

BuildSorting("sorts by WEAPON_IN_GAME_ORDER", () => {
	const builds = [
		mockBuild({
			id: 1,
			weapons: [{ weaponSplId: 1, maxPower: null, minRank: null }],
		}),
		mockBuild({
			id: 2,
			weapons: [{ weaponSplId: 10, maxPower: null, minRank: null }],
		}),
		mockBuild({
			id: 3,
			weapons: [
				{ weaponSplId: 1000, maxPower: null, minRank: null },
				{ weaponSplId: 1, maxPower: null, minRank: null },
			],
		}),
	];

	const sortedBuilds = sortBuilds({
		builds,
		buildSorting: ["WEAPON_IN_GAME_ORDER"],
		weaponPool: [],
	});

	assert.equal(sortedBuilds[2].id, 2);
});

BuildSorting("sorts by MODE", () => {
	const builds = [
		mockBuild({
			id: 1,
			modes: ["SZ"],
		}),
		mockBuild({
			id: 2,
			modes: ["CB"],
		}),
		mockBuild({
			id: 3,
			modes: ["SZ", "TC", "CB"],
		}),
	];

	const sortedBuilds = sortBuilds({
		builds,
		buildSorting: ["MODE"],
		weaponPool: [],
	});

	assert.equal(sortedBuilds[2].id, 2);
});

BuildSorting("sorts by MODE (no mode last)", () => {
	const builds = [
		mockBuild({
			id: 1,
			modes: [],
		}),
		mockBuild({
			id: 2,
			modes: ["CB"],
		}),
		mockBuild({
			id: 3,
			modes: ["SZ", "TC", "CB"],
		}),
	];

	const sortedBuilds = sortBuilds({
		builds,
		buildSorting: ["MODE"],
		weaponPool: [],
	});

	assert.equal(sortedBuilds[2].id, 1);
});

for (const identifier of ["HEADGEAR_ID", "CLOTHES_ID", "SHOES_ID"]) {
	BuildSorting(`sorts by ${identifier}`, () => {
		const key = (
			{
				HEADGEAR_ID: "headGearSplId",
				CLOTHES_ID: "clothesGearSplId",
				SHOES_ID: "shoesGearSplId",
			} as const
		)[identifier]!;

		const builds = [
			mockBuild({
				id: 1,
				[key]: 3,
			}),
			mockBuild({
				id: 2,
				[key]: 1,
			}),
			mockBuild({
				id: 3,
				[key]: 1,
			}),
		];

		const sortedBuilds = sortBuilds({
			builds,
			buildSorting: [identifier as any],
			weaponPool: [],
		});

		assert.equal(sortedBuilds[2].id, 1);
	});
}

BuildSorting("sorts when buildSort not given", () => {
	const builds = [mockBuild({}), mockBuild({}), mockBuild({})];

	sortBuilds({
		builds,
		weaponPool: [],
		buildSorting: null,
	});
});

BuildSorting("sorts by UPDATED_AT and ALPHABETICAL_TITLE", () => {
	const builds = [
		mockBuild({ id: 1, updatedAt: 3, title: "C" }),
		mockBuild({ id: 2, updatedAt: 2, title: "B" }),
		mockBuild({ id: 3, updatedAt: 2, title: "A" }),
	];

	const sortedBuilds = sortBuilds({
		builds,
		buildSorting: ["UPDATED_AT", "ALPHABETICAL_TITLE"],
		weaponPool: [],
	});

	assert.equal(sortedBuilds[0].id, 1);
	assert.equal(sortedBuilds[1].id, 3);
});

BuildSorting("sorts by ALPHABETICAL_TITLE and UPDATED_AT (reverse)", () => {
	const builds = [
		mockBuild({ id: 1, updatedAt: 3, title: "C" }),
		mockBuild({ id: 2, updatedAt: 2, title: "B" }),
		mockBuild({ id: 3, updatedAt: 2, title: "A" }),
	];

	const sortedBuilds = sortBuilds({
		builds,
		buildSorting: ["ALPHABETICAL_TITLE", "UPDATED_AT"],
		weaponPool: [],
	});

	assert.equal(sortedBuilds[0].id, 3);
});

BuildSorting("sorts by PUBLIC_BUILD", () => {
	const builds = [
		mockBuild({ id: 1, private: 1 }),
		mockBuild({ id: 2, private: 1 }),
		mockBuild({ id: 3, private: 0 }),
	];

	const sortedBuilds = sortBuilds({
		builds,
		buildSorting: ["PUBLIC_BUILD"],
		weaponPool: [],
	});

	assert.equal(sortedBuilds[0].id, 3);
	assert.equal(sortedBuilds[1].id, 1);
	assert.equal(sortedBuilds[2].id, 2);
});

BuildSorting("sorts by PRIVATE_BUILD", () => {
	const builds = [
		mockBuild({ id: 1, private: 0 }),
		mockBuild({ id: 2, private: 1 }),
		mockBuild({ id: 3, private: 1 }),
	];

	const sortedBuilds = sortBuilds({
		builds,
		buildSorting: ["PRIVATE_BUILD"],
		weaponPool: [],
	});

	assert.equal(sortedBuilds[0].id, 2);
	assert.equal(sortedBuilds[1].id, 3);
	assert.equal(sortedBuilds[2].id, 1);
});

BuildSorting("sorts by both PUBLIC_BUILD and PRIVATE_BUILD", () => {
	const builds = [
		mockBuild({ id: 1, private: 1 }),
		mockBuild({ id: 2, private: 0 }),
		mockBuild({ id: 3, private: 1 }),
		mockBuild({ id: 4, private: 0 }),
	];

	const sortedBuilds1 = sortBuilds({
		builds,
		buildSorting: ["PUBLIC_BUILD", "PRIVATE_BUILD"],
		weaponPool: [],
	});

	assert.equal(sortedBuilds1[0].id, 2);
	assert.equal(sortedBuilds1[1].id, 4);
	assert.equal(sortedBuilds1[2].id, 1);
	assert.equal(sortedBuilds1[3].id, 3);

	const sortedBuilds2 = sortBuilds({
		builds,
		buildSorting: ["PRIVATE_BUILD", "PUBLIC_BUILD"],
		weaponPool: [],
	});

	assert.equal(sortedBuilds2[0].id, 1);
	assert.equal(sortedBuilds2[1].id, 3);
	assert.equal(sortedBuilds2[2].id, 2);
	assert.equal(sortedBuilds2[3].id, 4);
});

BuildSorting.run();
