import clsx from "clsx";
import {
	ChevronDown,
	HeadphoneOff,
	Headphones,
	Heart,
	MessageSquare,
	MicOff,
	PanelLeft,
	Phone,
	Plus,
	ScanEye,
	Search,
	Settings,
} from "lucide-react";
import { SendouButton } from "~/components/elements/Button";
import { SendouPopover } from "~/components/elements/Popover";
import { NotificationDot } from "~/components/NotificationDot";
import {
	type HeaderVariant,
	MOCK_VOICE_ROOM_NAME,
	SQ_MOCK_STATUS,
	useHeaderMock,
} from "../header-test-state";
import {
	DeafenToggle,
	LeaveVoiceButton,
	MicToggle,
	ParticipantStack,
	ScannerPanel,
	ScannerRecDot,
	SqBadge,
	SqIcon,
	SqPanel,
	scannerShortLabel,
	useSqText,
	VoiceInputSettings,
	VoiceOutputSettings,
	VoicePanel,
	VoiceSettingsPanel,
	VoiceStatusDot,
	voiceLabel,
} from "./ActivityPanels";
import styles from "./MockHeader.module.css";

const NAV_MENUS = ["Play", "Tools", "Community"];

export function MockHeader({
	variant,
	layout,
}: {
	variant: HeaderVariant;
	layout: "desktop" | "tablet" | "mobile";
}) {
	const { state } = useHeaderMock();
	const compactSearch = state.compactSearch || variant === "dock";

	return (
		<div className={styles.shell} data-layout={layout}>
			<header className={styles.header}>
				<span className={styles.logo}>
					<span className={styles.logoS}>S</span>
					<span className={styles.logoInk}>ink</span>
				</span>
				<SendouButton
					variant="minimal"
					size="small"
					shape="square"
					icon={<PanelLeft />}
					className={styles.sideNavButton}
				/>
				<nav className={styles.menus}>
					{NAV_MENUS.map((name) => (
						<span key={name} className={styles.menuButton}>
							{name}
							<ChevronDown className={styles.menuChevron} />
						</span>
					))}
				</nav>
				<div className={styles.right}>
					<SendouButton
						size="small"
						variant="ghost"
						icon={<Heart />}
						className={styles.support}
					>
						Support
					</SendouButton>
					<Activities variant={variant} />
					<div className={styles.searchAndAdd}>
						<span
							className={clsx(
								styles.search,
								compactSearch && styles.searchCompact,
							)}
						>
							<Search className={styles.searchIcon} />
							<span className={clsx(styles.searchPlaceholder, "truncate")}>
								Search
							</span>
							<kbd className={styles.searchKbd}>Cmd+K</kbd>
						</span>
						<SendouButton
							size="small"
							icon={<Plus />}
							className={clsx(styles.add, compactSearch && styles.addCompact)}
						>
							<span className={styles.addLabel}>Add new</span>
						</SendouButton>
					</div>
					<SendouButton
						shape="square"
						size="small"
						variant="ghost"
						icon={<MessageSquare />}
						className={styles.chat}
					/>
				</div>
			</header>
			{variant === "subbar" ? <SubBar /> : null}
			<div className={styles.pageBody} aria-hidden>
				<span className={styles.skeletonTitle} />
				<span className={styles.skeletonLine} />
				<span className={styles.skeletonLine} />
			</div>
		</div>
	);
}

function Activities({ variant }: { variant: HeaderVariant }) {
	switch (variant) {
		case "inline":
			return (
				<div className={styles.activities}>
					<SqPill />
					<InlineVoicePill />
					<ScannerPill />
				</div>
			);
		case "buttons":
			return <ButtonCluster />;
		case "hub":
			return <ActivityHub />;
		case "dock":
			return (
				<div className={styles.activities}>
					<SqPill />
					<VoiceDock />
					<ScannerIconButton />
				</div>
			);
		case "subbar":
			return null;
	}
}

function SqPill() {
	const { state } = useHeaderMock();
	const text = useSqText();
	if (state.sq === "none") return null;

	return (
		<SendouPopover
			placement="bottom end"
			trigger={
				<button type="button" className={styles.pill} aria-label={text ?? ""}>
					<SqIcon />
					<span className={styles.pillText}>{text}</span>
					<SqBadge sq={state.sq} />
				</button>
			}
		>
			<SqPanel />
		</SendouPopover>
	);
}

function InlineVoicePill() {
	const { state } = useHeaderMock();
	if (state.voice === "none") return null;

	return (
		<div className={styles.pillGroup}>
			<SendouPopover
				placement="bottom end"
				trigger={
					<button
						type="button"
						className={clsx(styles.pill, styles.pillGroupStart)}
					>
						<VoiceStatusDot />
						{state.voice === "connected" || state.voice === "available" ? (
							<ParticipantStack max={3} />
						) : null}
						<span className={styles.pillText}>
							{state.voice === "connected" ? "Voice" : voiceLabel(state.voice)}
						</span>
					</button>
				}
			>
				<VoicePanel />
			</SendouPopover>
			{state.voice === "connected" ? (
				<div className={styles.pillGroupEnd}>
					<MicToggle className={styles.groupButton} />
					<DeafenToggle className={styles.groupButton} />
				</div>
			) : null}
		</div>
	);
}

function ScannerPill() {
	const { state } = useHeaderMock();
	if (state.scanner === "none") return null;

	return (
		<SendouPopover
			placement="bottom end"
			trigger={
				<button
					type="button"
					className={clsx(
						styles.pill,
						state.scanner === "error" && styles.pillError,
					)}
				>
					<ScannerRecDot />
					<span className={clsx(styles.pillText, styles.tabular)}>
						{state.scanner === "error"
							? "Scanner stopped"
							: `REC ${scannerShortLabel("capturing")}`}
					</span>
				</button>
			}
		>
			<ScannerPanel />
		</SendouPopover>
	);
}

function ButtonCluster() {
	const { state } = useHeaderMock();
	if (
		state.sq === "none" &&
		state.voice === "none" &&
		state.scanner === "none"
	) {
		return null;
	}

	return (
		<div className={styles.cluster}>
			{state.sq !== "none" ? (
				<ClusterButton
					label={SQ_MOCK_STATUS[state.sq].state}
					icon={<SqIcon />}
					corner={<SqBadge sq={state.sq} />}
				>
					<SqPanel />
				</ClusterButton>
			) : null}
			{state.voice !== "none" ? (
				<ClusterButton
					label="Voice"
					icon={<VoiceStateIcon />}
					dot={state.voice === "failed" || state.voice === "available"}
					className={clsx({
						[styles.clusterButtonSuccess]:
							state.voice === "connected" &&
							state.micEnabled &&
							!state.deafened,
						[styles.clusterButtonError]:
							state.voice === "connected" &&
							(!state.micEnabled || state.deafened),
					})}
				>
					<VoicePanel />
				</ClusterButton>
			) : null}
			{state.scanner !== "none" ? (
				<ClusterButton
					label="Scanner"
					icon={<ScanEye />}
					corner={<ScannerRecDot />}
					dot={state.scanner === "error"}
				>
					<ScannerPanel />
				</ClusterButton>
			) : null}
		</div>
	);
}

function ClusterButton({
	label,
	icon,
	corner,
	dot,
	className,
	children,
}: {
	label: string;
	icon: React.ReactNode;
	corner?: React.ReactNode;
	dot?: boolean;
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<span className={styles.clusterItem}>
			<SendouPopover
				placement="bottom end"
				trigger={
					<button
						type="button"
						className={clsx(styles.clusterButton, className)}
						aria-label={label}
						title={label}
					>
						{icon}
					</button>
				}
			>
				{children}
			</SendouPopover>
			{corner ? <span className={styles.clusterCorner}>{corner}</span> : null}
			{dot ? <NotificationDot /> : null}
		</span>
	);
}

function VoiceStateIcon() {
	const { state } = useHeaderMock();

	if (state.voice === "connected" && state.deafened) {
		return <HeadphoneOff className={styles.mirrored} />;
	}
	if (state.voice === "connected" && !state.micEnabled && !state.pushToTalk) {
		return <MicOff className={styles.mirrored} />;
	}

	return <Headphones />;
}

function ActivityHub() {
	const { state } = useHeaderMock();
	const sqText = useSqText();

	const sqStatus = state.sq === "none" ? null : SQ_MOCK_STATUS[state.sq];
	const hasSq = sqStatus !== null;
	const hasVoice = state.voice !== "none";
	const hasScanner = state.scanner !== "none";
	if (!hasSq && !hasVoice && !hasScanner) return null;

	const primary = hasSq ? "sq" : hasVoice ? "voice" : "scanner";
	const needsAttention =
		Boolean(sqStatus?.alert) ||
		state.voice === "failed" ||
		state.scanner === "error";

	return (
		<span className={styles.clusterItem}>
			<SendouPopover
				placement="bottom end"
				popoverClassName={styles.hubPopover}
				trigger={
					<button type="button" className={styles.pill}>
						{primary === "sq" ? (
							<>
								<SqIcon />
								<span className={styles.pillText}>{sqText}</span>
							</>
						) : primary === "voice" ? (
							<>
								<VoiceStatusDot />
								<span className={styles.pillText}>
									{voiceLabel(state.voice)}
								</span>
							</>
						) : (
							<>
								<ScannerRecDot />
								<span className={clsx(styles.pillText, styles.tabular)}>
									{state.scanner === "error"
										? "Scanner stopped"
										: `REC ${scannerShortLabel("capturing")}`}
								</span>
							</>
						)}
						<span className={styles.hubMinis}>
							{primary !== "voice" && hasVoice ? (
								<span
									className={clsx(styles.hubMini, {
										"text-success":
											state.voice === "connected" &&
											state.micEnabled &&
											!state.deafened,
										"text-error":
											state.voice === "failed" ||
											(state.voice === "connected" &&
												(!state.micEnabled || state.deafened)),
									})}
								>
									<VoiceStateIcon />
								</span>
							) : null}
							{primary !== "scanner" && hasScanner ? (
								<span className={styles.hubMini}>
									<ScannerRecDot />
								</span>
							) : null}
						</span>
						<ChevronDown className={styles.menuChevron} />
					</button>
				}
			>
				<div className={styles.hubContent}>
					{hasSq ? <SqPanel /> : null}
					{hasVoice ? <VoicePanel /> : null}
					{hasScanner ? <ScannerPanel /> : null}
				</div>
			</SendouPopover>
			{needsAttention ? <NotificationDot /> : null}
		</span>
	);
}

function VoiceDock() {
	const { state, update } = useHeaderMock();

	if (state.voice === "none") return null;

	if (state.voice === "available") {
		return (
			<SendouButton
				size="small"
				variant="outlined-success"
				icon={<Phone />}
				onClick={() => update({ voice: "connected" })}
				className={styles.dockJoin}
			>
				<span className={styles.pillText}>Join voice</span>
			</SendouButton>
		);
	}

	return (
		<div className={styles.dock}>
			<SendouPopover
				placement="bottom end"
				trigger={
					<button type="button" className={styles.dockStatus}>
						<VoiceStatusDot />
						{state.voice === "connected" ? (
							<span className={styles.dockAvatars}>
								<ParticipantStack max={3} />
							</span>
						) : (
							<span className={styles.pillText}>{voiceLabel(state.voice)}</span>
						)}
					</button>
				}
			>
				<VoicePanel />
			</SendouPopover>
			<span className={styles.dockDivider} />
			<span className={styles.dockSplit}>
				<MicToggle className={styles.groupButton} />
				<SendouPopover
					placement="bottom end"
					trigger={
						<button
							type="button"
							className={styles.caret}
							aria-label="Input options"
						>
							<ChevronDown />
						</button>
					}
				>
					<div className={styles.dockMenu}>
						<VoiceInputSettings />
					</div>
				</SendouPopover>
			</span>
			<span className={styles.dockSplit}>
				<DeafenToggle className={styles.groupButton} />
				<SendouPopover
					placement="bottom end"
					trigger={
						<button
							type="button"
							className={styles.caret}
							aria-label="Output options"
						>
							<ChevronDown />
						</button>
					}
				>
					<div className={styles.dockMenu}>
						<VoiceOutputSettings />
					</div>
				</SendouPopover>
			</span>
			<span className={styles.dockSettings}>
				<SendouPopover
					placement="bottom end"
					trigger={
						<SendouButton
							size="small"
							shape="square"
							variant="minimal"
							icon={<Settings />}
							aria-label="Voice settings"
							className={styles.groupButton}
						/>
					}
				>
					<VoiceSettingsPanel />
				</SendouPopover>
			</span>
		</div>
	);
}

function ScannerIconButton() {
	const { state } = useHeaderMock();
	if (state.scanner === "none") return null;

	return (
		<ClusterButton
			label="Scanner"
			icon={<ScanEye />}
			corner={<ScannerRecDot />}
			dot={state.scanner === "error"}
			className={styles.standaloneIconButton}
		>
			<ScannerPanel />
		</ClusterButton>
	);
}

function SubBar() {
	const { state } = useHeaderMock();
	const sqText = useSqText();

	const sqStatus = state.sq === "none" ? null : SQ_MOCK_STATUS[state.sq];
	const hasVoice = state.voice !== "none";
	const hasScanner = state.scanner !== "none";
	if (!sqStatus && !hasVoice && !hasScanner) return null;

	return (
		<div className={styles.subBar}>
			{sqStatus ? (
				<SendouPopover
					placement="bottom start"
					trigger={
						<button type="button" className={styles.subBarItem}>
							<SqIcon size={18} />
							<span className={styles.subBarText}>{sqText}</span>
							<span className={clsx(styles.subBarDetail, "truncate")}>
								{sqStatus.subtitle}
							</span>
							<SqBadge sq={state.sq} />
						</button>
					}
				>
					<SqPanel />
				</SendouPopover>
			) : null}
			{hasVoice ? (
				<div className={styles.subBarSection}>
					<SendouPopover
						placement="bottom start"
						trigger={
							<button type="button" className={styles.subBarItem}>
								<VoiceStatusDot />
								<span className={styles.subBarText}>
									{voiceLabel(state.voice)}
								</span>
								<span className={clsx(styles.subBarDetail, "truncate")}>
									{MOCK_VOICE_ROOM_NAME}
								</span>
								{state.voice === "connected" ? (
									<ParticipantStack max={4} />
								) : null}
							</button>
						}
					>
						<VoicePanel />
					</SendouPopover>
					{state.voice === "connected" ? (
						<span className={styles.subBarButtons}>
							<MicToggle />
							<DeafenToggle />
							<LeaveVoiceButton />
						</span>
					) : null}
				</div>
			) : null}
			{hasScanner ? (
				<div className={styles.subBarSection}>
					<SendouPopover
						placement="bottom end"
						trigger={
							<button type="button" className={styles.subBarItem}>
								<ScannerRecDot />
								<span className={clsx(styles.subBarText, styles.tabular)}>
									{state.scanner === "error"
										? "Scanner stopped"
										: `REC ${scannerShortLabel("capturing")}`}
								</span>
								{state.scanner !== "error" && state.scanner !== "capturing" ? (
									<span className={clsx(styles.subBarDetail, "truncate")}>
										{scannerShortLabel(state.scanner)}
									</span>
								) : null}
							</button>
						}
					>
						<ScannerPanel />
					</SendouPopover>
				</div>
			) : null}
		</div>
	);
}
