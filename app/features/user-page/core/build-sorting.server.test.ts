import { suite } from "uvu";
import * as assert from "uvu/assert";
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

BuildSorting.run();
