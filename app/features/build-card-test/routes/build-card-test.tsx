import { useState } from "react";
import { BuildCard, type BuildCardProps } from "~/components/BuildCard";
import {
	SendouChipRadio,
	SendouChipRadioGroup,
} from "~/components/elements/ChipRadio";
import { SendouSwitch } from "~/components/elements/Switch";
import { Main } from "~/components/Main";
import { OldBuildCard } from "~/components/OldBuildCard";
import { dateToDatabaseTimestamp } from "~/utils/dates";
import type { SendouRouteHandle } from "~/utils/remix.server";
import styles from "./build-card-test.module.css";

const CARD_WIDTHS = ["240", "280", "320"] as const;

const OWNER = {
	discordId: "79237403620945920",
	username: "Sendou",
	discordAvatar: "6fc41a44b069a0d2152ac06d1e496c6c",
	plusTier: 1,
} satisfies BuildCardProps["owner"];

const BASE_BUILD: BuildCardProps["build"] = {
	id: 1,
	title: "CBK/RSU Sloshing Machine (+Neo)",
	description: null,
	headGearSplId: 3030,
	clothesGearSplId: 8017,
	shoesGearSplId: 3023,
	updatedAt: dateToDatabaseTimestamp(new Date("2026-09-27T12:00:00Z")),
	isPrivate: 0,
	modes: null,
	weapons: [{ weaponSplId: 3020, isTop500: 0 }],
	abilities: [
		["CB", "RSU", "RSU", "QSJ"],
		["NS", "SSU", "SSU", "RSU"],
		["SJ", "QR", "RES", "ISS"],
	],
};

const VARIANTS: Array<{
	label: string;
	props: BuildCardProps;
}> = [
	{
		label: "Own build (mockup)",
		props: {
			build: BASE_BUILD,
			owner: OWNER,
			showOwner: false,
			canEdit: true,
		},
	},
	{
		label: "Builds page: other user, modes, top 500",
		props: {
			build: {
				...BASE_BUILD,
				id: 2,
				modes: ["SZ", "TC", "RM"],
				weapons: [{ weaponSplId: 3020, isTop500: 1 }],
			},
			owner: OWNER,
		},
	},
	{
		label: "Description",
		props: {
			build: {
				...BASE_BUILD,
				id: 3,
				title: "Zapperino",
				description:
					"Stay back, ping the enemy anchor and use Comeback to push after a trade.",
			},
			owner: { ...OWNER, plusTier: null },
		},
	},
	{
		label: "Two weapons",
		props: {
			build: {
				...BASE_BUILD,
				id: 4,
				weapons: [
					{ weaponSplId: 3020, isTop500: 0 },
					{ weaponSplId: 3021, isTop500: 1 },
				],
			},
			owner: OWNER,
		},
	},
	{
		label: "Three weapons",
		props: {
			build: {
				...BASE_BUILD,
				id: 10,
				weapons: [
					{ weaponSplId: 3020, isTop500: 0 },
					{ weaponSplId: 3021, isTop500: 1 },
					{ weaponSplId: 3000, isTop500: 0 },
				],
			},
			owner: OWNER,
		},
	},
	{
		label: "Four weapons",
		props: {
			build: {
				...BASE_BUILD,
				id: 11,
				weapons: [
					{ weaponSplId: 3020, isTop500: 0 },
					{ weaponSplId: 3021, isTop500: 1 },
					{ weaponSplId: 3000, isTop500: 0 },
					{ weaponSplId: 3010, isTop500: 0 },
				],
			},
			owner: OWNER,
		},
	},
	{
		label: "Max weapons (5)",
		props: {
			build: {
				...BASE_BUILD,
				id: 5,
				title: "Shooter frontline",
				modes: ["TW"],
				weapons: [
					{ weaponSplId: 40, isTop500: 1 },
					{ weaponSplId: 50, isTop500: 0 },
					{ weaponSplId: 60, isTop500: 0 },
					{ weaponSplId: 70, isTop500: 0 },
					{ weaponSplId: 80, isTop500: 0 },
				],
				abilities: [
					["ISM", "ISM", "SSU", "QSJ"],
					["ISM", "ISS", "SSU", "SSU"],
					["SSU", "ISM", "RES", "QR"],
				],
			},
			owner: OWNER,
		},
	},
	{
		label: "No gear",
		props: {
			build: {
				...BASE_BUILD,
				id: 6,
				headGearSplId: null,
				clothesGearSplId: null,
				shoesGearSplId: null,
			},
			owner: OWNER,
		},
	},
	{
		label: "Private",
		props: {
			build: { ...BASE_BUILD, id: 7, isPrivate: 1, title: "N-ZAP WIP" },
			owner: OWNER,
			showOwner: false,
			canEdit: true,
		},
	},
	{
		label: "Long title & username, all modes",
		props: {
			build: {
				...BASE_BUILD,
				id: 8,
				title:
					"Supersonic run speed backline build for when the enemy team brings two chargers",
				modes: ["TW", "SZ", "TC", "RM", "CB"],
				headGearSplId: 24014,
				clothesGearSplId: 2020,
				shoesGearSplId: 6026,
				weapons: [{ weaponSplId: 2070, isTop500: 1 }],
				updatedAt: dateToDatabaseTimestamp(new Date("2025-01-04T12:00:00Z")),
			},
			owner: { ...OWNER, username: "AVeryLongUsernameThatGoesOn" },
		},
	},
	{
		label: "Short title, no owner (user page widget)",
		props: {
			build: { ...BASE_BUILD, id: 9, title: "⭐" },
		},
	},
];

export const handle: SendouRouteHandle = {
	i18n: ["weapons", "builds", "gear"],
};

export default function BuildCardTestRoute() {
	const [cardWidth, setCardWidth] = useState<string>(CARD_WIDTHS[0]);
	const [showOld, setShowOld] = useState(false);

	return (
		<Main bigger className="stack lg">
			<div className={styles.controls}>
				<h1 className="text-lg">BuildCard redesign</h1>
				<SendouChipRadioGroup>
					{CARD_WIDTHS.map((width) => (
						<SendouChipRadio
							key={width}
							name="card-width"
							value={width}
							checked={cardWidth === width}
							onChange={setCardWidth}
						>
							{`${width}px`}
						</SendouChipRadio>
					))}
				</SendouChipRadioGroup>
				<SendouSwitch isSelected={showOld} onChange={setShowOld}>
					Compare with old
				</SendouSwitch>
			</div>

			<div
				className={styles.variants}
				style={{ "--card-width": `${cardWidth}px` } as React.CSSProperties}
			>
				{VARIANTS.map((variant) => (
					<figure key={variant.label} className={styles.variant}>
						<figcaption className={styles.label}>{variant.label}</figcaption>
						<div className={styles.cards}>
							<BuildCard {...variant.props} />
							{showOld ? <OldBuildCard {...variant.props} /> : null}
						</div>
					</figure>
				))}
			</div>
		</Main>
	);
}
