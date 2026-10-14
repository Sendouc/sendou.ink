import clsx from "clsx";
import {
	ArrowLeft,
	ExternalLink,
	HeadphoneOff,
	Headphones,
	Hourglass,
	Mic,
	MicOff,
	Phone,
	PhoneOff,
	RotateCcw,
	Settings,
	Signal,
	Square,
	Volume2,
	X,
} from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Avatar } from "~/components/Avatar";
import { SendouButton } from "~/components/elements/Button";
import {
	SendouChipRadio,
	SendouChipRadioGroup,
} from "~/components/elements/ChipRadio";
import { SendouSelect, SendouSelectItem } from "~/components/elements/Select";
import { Spinner } from "~/components/elements/Spinner";
import { SendouSwitch } from "~/components/elements/Switch";
import { Image, ModeImage, StageImage } from "~/components/Image";
import { navIconUrl } from "~/utils/urls";
import {
	MOCK_INPUT_DEVICES,
	MOCK_OUTPUT_DEVICES,
	MOCK_SCANNER_GAME,
	MOCK_VOICE_ROOM_NAME,
	type MockVoiceParticipant,
	SQ_MOCK_STATUS,
	type SqMockState,
	useHeaderMock,
	voiceParticipants,
} from "../header-test-state";
import styles from "./ActivityPanels.module.css";

export function SqIcon({ size = 20 }: { size?: number }) {
	const { state } = useHeaderMock();
	if (state.sq === "none") return null;

	const status = SQ_MOCK_STATUS[state.sq];
	const icon = status.logoUrl ? (
		<img
			src={status.logoUrl}
			width={size}
			height={size}
			alt=""
			className={styles.sqLogo}
		/>
	) : (
		<Image path={navIconUrl(status.navIcon)} size={size} alt="" />
	);

	if (!status.waiting) return icon;

	return (
		<span className={styles.sqIconWaiting}>
			{icon}
			<span className={styles.waitingMark}>
				<Hourglass />
			</span>
		</span>
	);
}

export function useSqText() {
	const { t } = useTranslation(["common"]);
	const { state } = useHeaderMock();
	if (state.sq === "none") return null;

	return t(`common:globalStatus.${SQ_MOCK_STATUS[state.sq].state}`);
}

export function SqBadge({ sq }: { sq: SqMockState }) {
	if (sq === "none") return null;
	const status = SQ_MOCK_STATUS[sq];

	if (status.alert) return <AlertBadge />;
	if (status.count) {
		return (
			<span className={clsx(styles.badge, styles.actionBadge)}>
				{status.count}
			</span>
		);
	}

	return null;
}

export function SqPanel() {
	const { state } = useHeaderMock();
	const text = useSqText();
	if (state.sq === "none") return null;

	const status = SQ_MOCK_STATUS[state.sq];

	return (
		<div className={styles.panel}>
			<div className={styles.panelHeader}>
				<SqIcon size={24} />
				<div className={styles.panelTitles}>
					<span className={styles.title}>{text}</span>
					<span className={styles.subtitle}>{status.subtitle}</span>
				</div>
				<SqBadge sq={state.sq} />
			</div>
			<SendouButton size="small" icon={<ExternalLink />}>
				{state.sq === "checkIn" ? "Go check in" : "Go to page"}
			</SendouButton>
		</div>
	);
}

export function VoiceStatusDot() {
	const { state } = useHeaderMock();

	return (
		<span
			className={clsx(styles.statusDot, {
				[styles.statusDotConnected]: state.voice === "connected",
				[styles.statusDotFailed]: state.voice === "failed",
				[styles.statusDotAvailable]: state.voice === "available",
			})}
		/>
	);
}

export function voiceLabel(voice: string) {
	switch (voice) {
		case "available":
			return "Voice available";
		case "connecting":
			return "Connecting…";
		case "failed":
			return "Voice failed";
		default:
			return "Voice connected";
	}
}

export function VoicePanel() {
	const [view, setView] = React.useState<"main" | "settings">("main");

	if (view === "settings") {
		return <VoiceSettingsPanel onBack={() => setView("main")} />;
	}

	return <VoiceMainPanel onOpenSettings={() => setView("settings")} />;
}

function VoiceMainPanel({ onOpenSettings }: { onOpenSettings: () => void }) {
	const { state, update } = useHeaderMock();
	const participants = voiceParticipants(state);

	if (state.voice === "available") {
		return (
			<div className={styles.panel}>
				<div className={styles.panelHeader}>
					<VoiceStatusDot />
					<div className={styles.panelTitles}>
						<span className={styles.title}>Voice chat available</span>
						<span className={styles.subtitle}>{MOCK_VOICE_ROOM_NAME}</span>
					</div>
				</div>
				<ParticipantList participants={participants.slice(1)} />
				<SendouButton
					size="small"
					variant="success"
					icon={<Phone />}
					onClick={() => update({ voice: "connected" })}
				>
					Join voice
				</SendouButton>
			</div>
		);
	}

	return (
		<div className={styles.panel}>
			<div className={styles.panelHeader}>
				<VoiceStatusDot />
				<div className={styles.panelTitles}>
					<span
						className={clsx(styles.title, {
							"text-success": state.voice === "connected",
							"text-error": state.voice === "failed",
						})}
					>
						{voiceLabel(state.voice)}
					</span>
					<span className={styles.subtitle}>{MOCK_VOICE_ROOM_NAME}</span>
				</div>
				{state.voice === "connected" ? (
					<span className={styles.ping} title="Latency">
						<Signal size={14} />
						32 ms
					</span>
				) : state.voice === "connecting" ? (
					<Spinner className={styles.spinner} />
				) : null}
			</div>
			{state.voice === "failed" ? (
				<span className="text-xs text-lighter">
					Could not connect. Check your connection and try again.
				</span>
			) : null}
			<ParticipantList participants={participants} />
			<div className={styles.controls}>
				{state.voice === "failed" ? (
					<SendouButton
						size="small"
						variant="minimal"
						icon={<RotateCcw />}
						onClick={() => update({ voice: "connected" })}
					>
						Retry
					</SendouButton>
				) : (
					<div className={styles.buttonGroup}>
						<MicToggle />
						<DeafenToggle />
					</div>
				)}
				<SendouButton
					size="small"
					shape="square"
					variant="minimal"
					icon={<Settings />}
					aria-label="Voice settings"
					title="Voice settings"
					onClick={onOpenSettings}
					className="ml-auto"
				/>
				<LeaveVoiceButton />
			</div>
		</div>
	);
}

function ParticipantList({
	participants,
}: {
	participants: MockVoiceParticipant[];
}) {
	const [expandedId, setExpandedId] = React.useState<number | null>(null);
	const [volumeById, setVolumeById] = React.useState<Record<number, number>>(
		{},
	);

	return (
		<ul className={styles.participants}>
			{participants.map((participant) => {
				const isExpanded = expandedId === participant.id;
				const volume = volumeById[participant.id] ?? 100;

				return (
					<li key={participant.id}>
						<button
							type="button"
							className={styles.participant}
							disabled={participant.isLocal}
							onClick={() => setExpandedId(isExpanded ? null : participant.id)}
						>
							<ParticipantAvatar participant={participant} />
							<span className="truncate">{participant.username}</span>
							{participant.isLocal ? (
								<span className={styles.youTag}>you</span>
							) : null}
							<span className={styles.participantIcons}>
								{volume === 0 ? (
									<Volume2 size={14} className="text-lighter" />
								) : null}
								{participant.muted ? (
									<MicOff
										size={14}
										className={clsx(styles.mirrored, "text-error")}
										aria-label="Muted"
									/>
								) : null}
								{participant.deafened ? (
									<HeadphoneOff
										size={14}
										className={clsx(styles.mirrored, "text-error")}
										aria-label="Deafened"
									/>
								) : null}
							</span>
						</button>
						{isExpanded ? (
							<label className={styles.userVolume}>
								<span className="text-xxs text-lighter">User volume</span>
								<input
									type="range"
									min={0}
									max={200}
									value={volume}
									onChange={(event) =>
										setVolumeById((current) => ({
											...current,
											[participant.id]: Number(event.target.value),
										}))
									}
								/>
								<span className={styles.sliderValue}>{volume}%</span>
							</label>
						) : null}
					</li>
				);
			})}
		</ul>
	);
}

function ParticipantAvatar({
	participant,
	size = "xxs",
}: {
	participant: MockVoiceParticipant;
	size?: "xxs" | "xs";
}) {
	return (
		<span className={styles.avatarWrapper}>
			<Avatar
				size={size}
				identiconInput={participant.username}
				alt={participant.username}
				title={participant.username}
				className={clsx(styles.avatar, participant.speaking && styles.speaking)}
			/>
			{participant.deafened ? (
				<span className={styles.avatarStatus}>
					<HeadphoneOff size={9} className={styles.mirrored} />
				</span>
			) : participant.muted ? (
				<span className={styles.avatarStatus}>
					<MicOff size={9} className={styles.mirrored} />
				</span>
			) : null}
		</span>
	);
}

/** Overlapping avatars of the people in the call, speaking ones ringed. */
export function ParticipantStack({ max = 4 }: { max?: number }) {
	const { state } = useHeaderMock();
	const participants = voiceParticipants(state);
	const shown = participants.slice(0, max);
	const hiddenCount = participants.length - shown.length;

	return (
		<span className={styles.stack}>
			{shown.map((participant) => (
				<ParticipantAvatar key={participant.id} participant={participant} />
			))}
			{hiddenCount > 0 ? (
				<span className={styles.stackMore}>+{hiddenCount}</span>
			) : null}
		</span>
	);
}

export function MicToggle({ className }: { className?: string }) {
	const { state, update } = useHeaderMock();
	const isDisabled = state.voice !== "connected";

	if (state.pushToTalk) {
		const setTalking = (talking: boolean) => {
			if (state.micEnabled !== talking) update({ micEnabled: talking });
		};

		return (
			<SendouButton
				size="small"
				shape="square"
				variant={state.micEnabled ? "minimal-success" : "minimal"}
				icon={<Mic />}
				isDisabled={isDisabled}
				aria-label="Hold to talk"
				title="Hold to talk"
				className={clsx(styles.pushToTalk, className)}
				onPointerDown={() => setTalking(true)}
				onPointerUp={() => setTalking(false)}
				onPointerLeave={() => setTalking(false)}
				onPointerCancel={() => setTalking(false)}
			/>
		);
	}

	const label = state.micEnabled ? "Mute" : "Unmute";

	return (
		<SendouButton
			size="small"
			shape="square"
			variant={state.micEnabled ? "minimal-success" : "minimal-destructive"}
			icon={state.micEnabled ? <Mic /> : <MicOff className={styles.mirrored} />}
			isDisabled={isDisabled}
			aria-label={label}
			aria-pressed={state.micEnabled}
			title={label}
			className={className}
			onClick={() => update({ micEnabled: !state.micEnabled })}
		/>
	);
}

export function DeafenToggle({ className }: { className?: string }) {
	const { state, update } = useHeaderMock();
	const label = state.deafened ? "Undeafen" : "Deafen";

	return (
		<SendouButton
			size="small"
			shape="square"
			variant={state.deafened ? "minimal-destructive" : "minimal-success"}
			icon={
				state.deafened ? (
					<HeadphoneOff className={styles.mirrored} />
				) : (
					<Headphones />
				)
			}
			isDisabled={state.voice !== "connected"}
			aria-label={label}
			aria-pressed={state.deafened}
			title={label}
			className={className}
			onClick={() => update({ deafened: !state.deafened })}
		/>
	);
}

export function LeaveVoiceButton() {
	const { update } = useHeaderMock();

	return (
		<SendouButton
			size="small"
			shape="square"
			variant="outlined-destructive"
			icon={<PhoneOff />}
			aria-label="Leave voice"
			title="Leave voice"
			onClick={() => update({ voice: "available" })}
		/>
	);
}

export function VoiceSettingsPanel({ onBack }: { onBack?: () => void }) {
	const { state, updateVoiceSettings } = useHeaderMock();
	const settings = state.voiceSettings;

	return (
		<div className={clsx(styles.panel, styles.settingsPanel)}>
			<div className={styles.panelHeader}>
				{onBack ? (
					<SendouButton
						size="small"
						shape="square"
						variant="minimal"
						icon={<ArrowLeft />}
						aria-label="Back"
						onClick={onBack}
					/>
				) : null}
				<span className={styles.title}>Voice settings</span>
			</div>
			<VoiceInputSettings />
			<VoiceOutputSettings />
			<section className={styles.section}>
				<h3 className={styles.sectionTitle}>Processing</h3>
				<SendouSwitch
					size="small"
					isSelected={settings.noiseSuppression}
					onChange={(noiseSuppression) =>
						updateVoiceSettings({ noiseSuppression })
					}
				>
					Noise suppression
				</SendouSwitch>
				<SendouSwitch
					size="small"
					isSelected={settings.echoCancellation}
					onChange={(echoCancellation) =>
						updateVoiceSettings({ echoCancellation })
					}
				>
					Echo cancellation
				</SendouSwitch>
				<SendouSwitch
					size="small"
					isSelected={settings.autoGainControl}
					onChange={(autoGainControl) =>
						updateVoiceSettings({ autoGainControl })
					}
				>
					Automatic gain control
				</SendouSwitch>
				<SendouSwitch
					size="small"
					isSelected={settings.sounds}
					onChange={(sounds) => updateVoiceSettings({ sounds })}
				>
					Join & leave sounds
				</SendouSwitch>
			</section>
		</div>
	);
}

/** Input device, volume, level and mode — the dock's mic caret menu. */
export function VoiceInputSettings() {
	const { state, update, updateVoiceSettings } = useHeaderMock();
	const settings = state.voiceSettings;

	return (
		<section className={styles.section}>
			<h3 className={styles.sectionTitle}>Input</h3>
			<SendouSelect
				aria-label="Input device"
				items={MOCK_INPUT_DEVICES}
				selectedKey={settings.inputDeviceId}
				onSelectionChange={(key) =>
					updateVoiceSettings({ inputDeviceId: String(key) })
				}
			>
				{(item) => (
					<SendouSelectItem key={item.id} id={item.id}>
						{item.name}
					</SendouSelectItem>
				)}
			</SendouSelect>
			<Slider
				label="Input volume"
				value={settings.inputVolume}
				max={200}
				onChange={(inputVolume) => updateVoiceSettings({ inputVolume })}
			/>
			<div className={styles.levelRow}>
				<span className="text-xxs text-lighter">Input level</span>
				<span
					className={clsx(styles.level, {
						[styles.levelActive]:
							state.micEnabled &&
							!state.deafened &&
							state.voice === "connected",
					})}
					style={
						{
							"--sensitivity": `${settings.sensitivity}%`,
						} as React.CSSProperties
					}
				/>
			</div>
			<SendouChipRadioGroup>
				<SendouChipRadio
					name="input-mode"
					value="vad"
					checked={!state.pushToTalk}
					onChange={() => update({ pushToTalk: false })}
				>
					Voice activity
				</SendouChipRadio>
				<SendouChipRadio
					name="input-mode"
					value="ptt"
					checked={state.pushToTalk}
					onChange={() => update({ pushToTalk: true, micEnabled: false })}
				>
					Push to talk
				</SendouChipRadio>
			</SendouChipRadioGroup>
			{!state.pushToTalk ? (
				<Slider
					label="Sensitivity"
					value={settings.sensitivity}
					max={100}
					onChange={(sensitivity) => updateVoiceSettings({ sensitivity })}
				/>
			) : (
				<span className="text-xxs text-lighter">
					Hold the mic button (or Space while the page has focus) to talk
				</span>
			)}
		</section>
	);
}

/** Output device & volume — the dock's headphones caret menu. */
export function VoiceOutputSettings() {
	const { state, updateVoiceSettings } = useHeaderMock();
	const settings = state.voiceSettings;

	return (
		<section className={styles.section}>
			<h3 className={styles.sectionTitle}>Output</h3>
			<SendouSelect
				aria-label="Output device"
				items={MOCK_OUTPUT_DEVICES}
				selectedKey={settings.outputDeviceId}
				onSelectionChange={(key) =>
					updateVoiceSettings({ outputDeviceId: String(key) })
				}
			>
				{(item) => (
					<SendouSelectItem key={item.id} id={item.id}>
						{item.name}
					</SendouSelectItem>
				)}
			</SendouSelect>
			<span className="text-xxs text-lighter">
				Picking the output device isn't supported by Safari
			</span>
			<Slider
				label="Output volume"
				value={settings.outputVolume}
				max={200}
				onChange={(outputVolume) => updateVoiceSettings({ outputVolume })}
			/>
		</section>
	);
}

function Slider({
	label,
	value,
	max,
	onChange,
}: {
	label: string;
	value: number;
	max: number;
	onChange: (value: number) => void;
}) {
	return (
		<label className={styles.slider}>
			<span className="text-xxs text-lighter">{label}</span>
			<input
				type="range"
				min={0}
				max={max}
				value={value}
				onChange={(event) => onChange(Number(event.target.value))}
			/>
			<span className={styles.sliderValue}>{value}%</span>
		</label>
	);
}

export function ScannerIcon() {
	return <Image path={navIconUrl("scanner")} size={20} alt="" />;
}

/** Rec dot while capturing, the same "!" badge as other activities when the scanner stopped. */
export function ScannerCorner() {
	const { state } = useHeaderMock();
	if (state.scanner === "error") {
		return (
			<span className={clsx(styles.badge, styles.errorBadge)}>
				<X />
			</span>
		);
	}

	return <ScannerRecDot />;
}

function AlertBadge() {
	return <span className={clsx(styles.badge, styles.alertBadge)}>!</span>;
}

export function ScannerRecDot() {
	const { state } = useHeaderMock();

	return (
		<span
			className={clsx(styles.recDot, {
				[styles.recDotError]: state.scanner === "error",
			})}
		/>
	);
}

export function scannerShortLabel(scanner: string) {
	switch (scanner) {
		case "inGame":
			return "In game";
		case "uploading":
			return "Uploading";
		case "error":
			return "Scanner stopped";
		default:
			return "1:23:45";
	}
}

export function ScannerPanel() {
	const { state, update } = useHeaderMock();
	const { t } = useTranslation(["game-misc"]);

	const isError = state.scanner === "error";

	return (
		<div className={styles.panel}>
			<div className={styles.panelHeader}>
				<ScannerRecDot />
				<div className={styles.panelTitles}>
					<span className={clsx(styles.title, isError && "text-error")}>
						{isError ? "Capture stopped" : "Capturing"}
					</span>
					<span className={styles.subtitle}>Elgato HD60 X</span>
				</div>
				{!isError ? <span className={styles.ping}>1:23:45</span> : null}
			</div>
			{state.scanner === "inGame" ? (
				<div className={styles.scannerGame}>
					<StageImage
						stageId={MOCK_SCANNER_GAME.stageId}
						width={64}
						className="rounded-sm"
					/>
					<div className={styles.panelTitles}>
						<span className="text-xs font-semi-bold stack horizontal xs items-center">
							<ModeImage mode={MOCK_SCANNER_GAME.mode} size={16} />
							{t(`game-misc:STAGE_${MOCK_SCANNER_GAME.stageId}`)}
						</span>
						<span className={styles.subtitle}>
							In game · {MOCK_SCANNER_GAME.score}
						</span>
					</div>
				</div>
			) : state.scanner === "uploading" ? (
				<div className={styles.scannerInfo}>
					<Spinner className={styles.spinner} />
					Uploading 1 game…
				</div>
			) : isError ? (
				<span className="text-xs text-error">
					The capture source ended (was the capture card unplugged?)
				</span>
			) : (
				<div className={clsx(styles.scannerInfo, "text-lighter")}>
					Waiting for a game to start…
				</div>
			)}
			<dl className={styles.stats}>
				<div>
					<dt>Games</dt>
					<dd>5</dd>
				</div>
				<div>
					<dt>Uploaded</dt>
					<dd>{state.scanner === "uploading" ? "4/5" : "5/5"}</dd>
				</div>
				<div>
					<dt>Clips</dt>
					<dd>12</dd>
				</div>
			</dl>
			<div className={styles.controls}>
				<SendouButton
					size="small"
					variant="outlined"
					icon={<Image path={navIconUrl("scanner")} size={16} alt="" />}
				>
					Open scanner
				</SendouButton>
				{isError ? (
					<SendouButton
						size="small"
						icon={<RotateCcw />}
						className="ml-auto"
						onClick={() => update({ scanner: "capturing" })}
					>
						Restart
					</SendouButton>
				) : (
					<SendouButton
						size="small"
						variant="outlined-destructive"
						icon={<Square />}
						className="ml-auto"
						onClick={() => update({ scanner: "none" })}
					>
						Stop
					</SendouButton>
				)}
			</div>
		</div>
	);
}
