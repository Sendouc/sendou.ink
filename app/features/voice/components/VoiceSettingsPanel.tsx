import { ArrowLeft } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import * as v from "valibot";
import { SendouButton } from "~/components/elements/Button";
import {
	SendouChipRadio,
	SendouChipRadioGroup,
} from "~/components/elements/ChipRadio";
import { SendouSelect, SendouSelectItem } from "~/components/elements/Select";
import { SendouSwitch } from "~/components/elements/Switch";
import {
	ActivityPanel,
	ActivityPanelHeader,
	ActivityPanelSection,
} from "~/components/layout/ActivityPanel";
import { usePersistedState } from "~/modules/persisted-state/hooks";
import * as PersistedState from "~/modules/persisted-state/persisted-state";
import type { VoiceActivity } from "../voice-activity";
import styles from "./VoiceSettingsPanel.module.css";

const DEFAULT_DEVICE_ID = "default";

// xxx: none of these reach the Daily call yet, they are only remembered
const voiceSettingsPersisted = PersistedState.define({
	key: "voiceSettings",
	storage: "local",
	schema: v.object({
		inputDeviceId: v.string(),
		outputDeviceId: v.string(),
		inputVolume: v.number(),
		outputVolume: v.number(),
		sensitivity: v.number(),
		noiseSuppression: v.boolean(),
		echoCancellation: v.boolean(),
		autoGainControl: v.boolean(),
		sounds: v.boolean(),
	}),
	default: {
		inputDeviceId: DEFAULT_DEVICE_ID,
		outputDeviceId: DEFAULT_DEVICE_ID,
		inputVolume: 100,
		outputVolume: 100,
		sensitivity: 30,
		noiseSuppression: true,
		echoCancellation: true,
		autoGainControl: true,
		sounds: true,
	},
});

type VoiceSettings = (typeof voiceSettingsPersisted)["default"];

/** Devices, levels and audio processing of the voice call, opened from its header panel. */
export function VoiceSettingsPanel({
	voice: { state, actions },
	onBack,
}: {
	voice: VoiceActivity;
	onBack: () => void;
}) {
	const { t } = useTranslation(["common"]);
	const [settings, setSettings] = usePersistedState(voiceSettingsPersisted);
	const devices = useAudioDevices();

	const update = (patch: Partial<VoiceSettings>) =>
		setSettings((current) => ({ ...current, ...patch }));

	return (
		<ActivityPanel className={styles.panel}>
			<ActivityPanelHeader
				icon={
					<SendouButton
						size="small"
						shape="square"
						variant="minimal"
						icon={<ArrowLeft />}
						aria-label={t("common:actions.back")}
						onClick={onBack}
					/>
				}
				title={t("common:chat.voice.settings.title")}
			/>
			<ActivityPanelSection title={t("common:chat.voice.settings.input")}>
				<DeviceSelect
					label={t("common:chat.voice.settings.inputDevice")}
					devices={devices.input}
					selectedId={settings.inputDeviceId}
					onChange={(inputDeviceId) => update({ inputDeviceId })}
				/>
				<Slider
					label={t("common:chat.voice.settings.inputVolume")}
					value={settings.inputVolume}
					max={200}
					onChange={(inputVolume) => update({ inputVolume })}
				/>
				<div className={styles.levelRow}>
					<span className="text-xxs text-lighter">
						{t("common:chat.voice.settings.inputLevel")}
					</span>
					{/* xxx: fill with the microphone's live level */}
					<span
						className={styles.level}
						style={
							{
								"--sensitivity": `${settings.sensitivity}%`,
							} as React.CSSProperties
						}
					/>
				</div>
				<SendouChipRadioGroup>
					<SendouChipRadio
						name="voice-input-mode"
						value="OPEN_MIC"
						checked={state.inputMode === "OPEN_MIC"}
						onChange={() => actions.setInputMode("OPEN_MIC")}
					>
						{t("common:chat.voice.settings.voiceActivity")}
					</SendouChipRadio>
					<SendouChipRadio
						name="voice-input-mode"
						value="PUSH_TO_TALK"
						checked={state.inputMode === "PUSH_TO_TALK"}
						onChange={() => actions.setInputMode("PUSH_TO_TALK")}
					>
						{t("common:chat.voice.settings.pushToTalk")}
					</SendouChipRadio>
				</SendouChipRadioGroup>
				{state.inputMode === "OPEN_MIC" ? (
					<Slider
						label={t("common:chat.voice.settings.sensitivity")}
						value={settings.sensitivity}
						max={100}
						onChange={(sensitivity) => update({ sensitivity })}
					/>
				) : (
					<span className="text-xxs text-lighter">
						{t("common:chat.voice.settings.pushToTalkHint")}
					</span>
				)}
			</ActivityPanelSection>
			<ActivityPanelSection title={t("common:chat.voice.settings.output")}>
				<DeviceSelect
					label={t("common:chat.voice.settings.outputDevice")}
					devices={devices.output}
					selectedId={settings.outputDeviceId}
					onChange={(outputDeviceId) => update({ outputDeviceId })}
				/>
				<span className="text-xxs text-lighter">
					{t("common:chat.voice.settings.outputDeviceUnsupported")}
				</span>
				<Slider
					label={t("common:chat.voice.settings.outputVolume")}
					value={settings.outputVolume}
					max={200}
					onChange={(outputVolume) => update({ outputVolume })}
				/>
			</ActivityPanelSection>
			<ActivityPanelSection title={t("common:chat.voice.settings.processing")}>
				<SendouSwitch
					size="small"
					isSelected={settings.noiseSuppression}
					onChange={(noiseSuppression) => update({ noiseSuppression })}
				>
					{t("common:chat.voice.settings.noiseSuppression")}
				</SendouSwitch>
				<SendouSwitch
					size="small"
					isSelected={settings.echoCancellation}
					onChange={(echoCancellation) => update({ echoCancellation })}
				>
					{t("common:chat.voice.settings.echoCancellation")}
				</SendouSwitch>
				<SendouSwitch
					size="small"
					isSelected={settings.autoGainControl}
					onChange={(autoGainControl) => update({ autoGainControl })}
				>
					{t("common:chat.voice.settings.autoGainControl")}
				</SendouSwitch>
				{/* xxx: the settings page's sound toggles are the source of truth for these, link the two */}
				<SendouSwitch
					size="small"
					isSelected={settings.sounds}
					onChange={(sounds) => update({ sounds })}
				>
					{t("common:chat.voice.settings.sounds")}
				</SendouSwitch>
			</ActivityPanelSection>
		</ActivityPanel>
	);
}

function DeviceSelect({
	label,
	devices,
	selectedId,
	onChange,
}: {
	label: string;
	devices: Array<{ id: string; name: string }>;
	selectedId: string;
	onChange: (id: string) => void;
}) {
	const { t } = useTranslation(["common"]);
	const items = [
		{
			id: DEFAULT_DEVICE_ID,
			name: t("common:chat.voice.settings.defaultDevice"),
		},
		...devices.filter((device) => device.id !== DEFAULT_DEVICE_ID),
	];

	return (
		<SendouSelect
			aria-label={label}
			items={items}
			selectedKey={
				items.some((item) => item.id === selectedId)
					? selectedId
					: DEFAULT_DEVICE_ID
			}
			onSelectionChange={(key) => onChange(String(key))}
		>
			{(item) => (
				<SendouSelectItem key={item.id} id={item.id}>
					{item.name}
				</SendouSelectItem>
			)}
		</SendouSelect>
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

/** The browser's audio inputs & outputs; labels are only filled in once a microphone permission was given. */
function useAudioDevices() {
	const [devices, setDevices] = React.useState<{
		input: Array<{ id: string; name: string }>;
		output: Array<{ id: string; name: string }>;
	}>({ input: [], output: [] });

	React.useEffect(() => {
		if (!navigator.mediaDevices?.enumerateDevices) return;

		let cancelled = false;
		void navigator.mediaDevices.enumerateDevices().then((all) => {
			if (cancelled) return;
			const ofKind = (kind: MediaDeviceKind) =>
				all
					.filter((device) => device.kind === kind && device.label)
					.map((device) => ({ id: device.deviceId, name: device.label }));
			setDevices({
				input: ofKind("audioinput"),
				output: ofKind("audiooutput"),
			});
		});

		return () => {
			cancelled = true;
		};
	}, []);

	return devices;
}
