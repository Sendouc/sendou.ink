import { useState } from "react";
import {
	SendouChipRadio,
	SendouChipRadioGroup,
} from "~/components/elements/ChipRadio";
import { SendouSwitch } from "~/components/elements/Switch";
import { Main } from "~/components/Main";
import { MockHeader } from "../components/MockHeader";
import {
	HEADER_VARIANTS,
	HeaderMockContext,
	type HeaderMockState,
	type HeaderVariant,
	INITIAL_HEADER_MOCK_STATE,
	useHeaderMock,
} from "../header-test-state";
import styles from "./header-test.module.css";

const LAYOUTS = [
	{ id: "desktop", name: "Desktop", width: 1100 },
	{ id: "tablet", name: "Tablet", width: 820 },
	{ id: "mobile", name: "Mobile", width: 375 },
] as const;

type LayoutId = (typeof LAYOUTS)[number]["id"];

const SQ_OPTIONS: Array<[HeaderMockState["sq"], string]> = [
	["none", "None"],
	["preparing", "Preparing"],
	["queued", "In queue (likes)"],
	["expired", "Group inactive"],
	["readyCheck", "Ready check"],
	["match", "In match"],
	["checkIn", "Tournament check-in"],
	["toWaiting", "Tournament waiting"],
	["toCast", "Tournament waiting for cast"],
	["toMatch", "Tournament match"],
];

const VOICE_OPTIONS: Array<[HeaderMockState["voice"], string]> = [
	["none", "None"],
	["available", "Available to join"],
	["connecting", "Connecting"],
	["connected", "Connected"],
	["failed", "Failed"],
];

const SCANNER_OPTIONS: Array<[HeaderMockState["scanner"], string]> = [
	["none", "None"],
	["capturing", "Capturing"],
	["inGame", "In game"],
	["uploading", "Uploading"],
	["error", "Error"],
];

export default function HeaderTestRoute() {
	const [mockState, setMockState] = useState(INITIAL_HEADER_MOCK_STATE);

	return (
		<HeaderMockContext value={{ state: mockState, setState: setMockState }}>
			<HeaderTest />
		</HeaderMockContext>
	);
}

function HeaderTest() {
	const { state, update } = useHeaderMock();
	const [variant, setVariant] = useState<HeaderVariant | "all">("buttons");
	const [layout, setLayout] = useState<LayoutId | "all">("all");

	const shownVariants =
		variant === "all"
			? HEADER_VARIANTS
			: HEADER_VARIANTS.filter((candidate) => candidate.id === variant);
	const shownLayouts =
		layout === "all"
			? LAYOUTS
			: LAYOUTS.filter((candidate) => candidate.id === layout);

	return (
		<Main bigger className={styles.main}>
			<div className={styles.controls}>
				<ControlRow label="Variant">
					<SendouChipRadioGroup wrap>
						{HEADER_VARIANTS.map((candidate) => (
							<SendouChipRadio
								key={candidate.id}
								name="variant"
								value={candidate.id}
								checked={variant === candidate.id}
								onChange={() => setVariant(candidate.id)}
							>
								{candidate.name}
							</SendouChipRadio>
						))}
						<SendouChipRadio
							name="variant"
							value="all"
							checked={variant === "all"}
							onChange={() => setVariant("all")}
						>
							Compare all
						</SendouChipRadio>
					</SendouChipRadioGroup>
				</ControlRow>
				<ControlRow label="Width">
					<SendouChipRadioGroup wrap>
						{[{ id: "all", name: "All" } as const, ...LAYOUTS].map(
							(candidate) => (
								<SendouChipRadio
									key={candidate.id}
									name="layout"
									value={candidate.id}
									checked={layout === candidate.id}
									onChange={() => setLayout(candidate.id)}
								>
									{candidate.name}
								</SendouChipRadio>
							),
						)}
					</SendouChipRadioGroup>
				</ControlRow>
				<ControlRow label="SendouQ / tournament">
					<StateChips
						name="sq"
						options={SQ_OPTIONS}
						value={state.sq}
						onChange={(sq) => update({ sq })}
					/>
				</ControlRow>
				<ControlRow label="Voice">
					<StateChips
						name="voice"
						options={VOICE_OPTIONS}
						value={state.voice}
						onChange={(voice) => update({ voice })}
					/>
				</ControlRow>
				<ControlRow label="Scanner">
					<StateChips
						name="scanner"
						options={SCANNER_OPTIONS}
						value={state.scanner}
						onChange={(scanner) => update({ scanner })}
					/>
				</ControlRow>
				<ControlRow label="Options">
					<div className={styles.switches}>
						<SendouSwitch
							size="small"
							isSelected={state.compactSearch}
							onChange={(compactSearch) => update({ compactSearch })}
						>
							Collapse search & add new to icons
						</SendouSwitch>
						<SendouSwitch
							size="small"
							isSelected={state.pushToTalk}
							onChange={(pushToTalk) =>
								update({ pushToTalk, micEnabled: !pushToTalk })
							}
						>
							Push to talk
						</SendouSwitch>
					</div>
				</ControlRow>
			</div>

			{shownVariants.map((shownVariant) => (
				<section key={shownVariant.id} className={styles.variant}>
					<div>
						<h2 className={styles.variantName}>{shownVariant.name}</h2>
						<p className={styles.variantDescription}>
							{shownVariant.description}
						</p>
					</div>
					{shownLayouts.map((shownLayout) => (
						<div key={shownLayout.id} className={styles.frameContainer}>
							<span className={styles.frameLabel}>
								{shownLayout.name} · {shownLayout.width}px (drag the corner to
								resize)
							</span>
							<div
								className={styles.frame}
								style={{ width: shownLayout.width }}
							>
								<MockHeader variant={shownVariant.id} layout={shownLayout.id} />
							</div>
						</div>
					))}
				</section>
			))}
		</Main>
	);
}

function ControlRow({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className={styles.controlRow}>
			<span className={styles.controlLabel}>{label}</span>
			{children}
		</div>
	);
}

function StateChips<T extends string>({
	name,
	options,
	value,
	onChange,
}: {
	name: string;
	options: Array<[T, string]>;
	value: T;
	onChange: (value: T) => void;
}) {
	return (
		<SendouChipRadioGroup wrap>
			{options.map(([optionValue, optionLabel]) => (
				<SendouChipRadio
					key={optionValue}
					name={name}
					value={optionValue}
					checked={value === optionValue}
					onChange={() => onChange(optionValue)}
				>
					{optionLabel}
				</SendouChipRadio>
			))}
		</SendouChipRadioGroup>
	);
}
