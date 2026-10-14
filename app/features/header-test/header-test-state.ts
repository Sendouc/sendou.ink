import * as React from "react";
import type { GlobalStatusState } from "~/features/global-status/global-status-types";
import type { ModeShort, StageId } from "~/modules/in-game-lists/types";

export const HEADER_VARIANTS = [
	{
		id: "inline",
		name: "Inline pills",
		description:
			"Today's header with a pill per activity: voice gets its mic & deafen buttons inline, scanner a REC timer. Baseline to compare against.",
	},
	{
		id: "buttons",
		name: "Popover buttons",
		description:
			"One square button per activity, glanceable state via icon colour + dots. Everything else lives in the popover it opens.",
	},
	{
		id: "hub",
		name: "Activity hub",
		description:
			"A single pill shows the most important activity, the others as small icons. One popover stacks every activity's panel.",
	},
	{
		id: "dock",
		name: "Voice dock",
		description:
			"Discord-style voice cluster: mic & deafen always visible with carets for device menus, gear for full settings. Search collapses to an icon.",
	},
	{
		id: "subbar",
		name: "Sub bar",
		description:
			"Header stays as is, activities get their own thin bar under it which only appears while something is going on.",
	},
] as const;

export type HeaderVariant = (typeof HEADER_VARIANTS)[number]["id"];

export type SqMockState =
	| "none"
	| "preparing"
	| "queued"
	| "expired"
	| "readyCheck"
	| "match"
	| "checkIn"
	| "toWaiting"
	| "toCast"
	| "toMatch";
export type VoiceMockState =
	| "none"
	| "available"
	| "connecting"
	| "connected"
	| "failed";
export type ScannerMockState =
	| "none"
	| "capturing"
	| "inGame"
	| "uploading"
	| "error";

export interface HeaderMockState {
	sq: SqMockState;
	voice: VoiceMockState;
	scanner: ScannerMockState;
	micEnabled: boolean;
	deafened: boolean;
	pushToTalk: boolean;
	compactSearch: boolean;
	voiceSettings: MockVoiceSettings;
}

export interface MockVoiceSettings {
	inputDeviceId: string;
	outputDeviceId: string;
	inputVolume: number;
	outputVolume: number;
	sensitivity: number;
	noiseSuppression: boolean;
	echoCancellation: boolean;
	autoGainControl: boolean;
	sounds: boolean;
}

export const INITIAL_HEADER_MOCK_STATE: HeaderMockState = {
	sq: "match",
	voice: "connected",
	scanner: "inGame",
	micEnabled: true,
	deafened: false,
	pushToTalk: false,
	compactSearch: false,
	voiceSettings: {
		inputDeviceId: "default",
		outputDeviceId: "default",
		inputVolume: 100,
		outputVolume: 80,
		sensitivity: 30,
		noiseSuppression: true,
		echoCancellation: true,
		autoGainControl: true,
		sounds: true,
	},
};

const MOCK_TOURNAMENT_LOGO_URL =
	"https://sendou.nyc3.cdn.digitaloceanspaces.com/tournament-logo-itz.png";

export const SQ_MOCK_STATUS: Record<
	Exclude<SqMockState, "none">,
	{
		state: GlobalStatusState;
		navIcon: string;
		logoUrl?: string;
		subtitle: string;
		count?: number;
		alert?: boolean;
		waiting?: boolean;
	}
> = {
	preparing: {
		state: "SQ_PREPARING",
		navIcon: "sendouq",
		subtitle: "Group 2/4 · Invite teammates to join",
		waiting: true,
	},
	queued: {
		state: "SQ_QUEUED",
		navIcon: "sendouq",
		subtitle: "Group 3/4 · 2 new likes",
		count: 2,
	},
	expired: {
		state: "SQ_EXPIRED",
		navIcon: "sendouq",
		subtitle: "Group hidden from others · Refresh to keep looking",
		alert: true,
	},
	readyCheck: {
		state: "SQ_READY_CHECK",
		navIcon: "sendouq",
		subtitle: "Confirm you are ready to play",
		alert: true,
	},
	match: {
		state: "SQ_MATCH",
		navIcon: "sendouq",
		subtitle: "SendouQ match #12345 · Game 3",
	},
	checkIn: {
		state: "TO_CHECKIN",
		navIcon: "medal",
		logoUrl: MOCK_TOURNAMENT_LOGO_URL,
		subtitle: "In The Zone 42 · closes in 12 min",
		alert: true,
	},
	toWaiting: {
		state: "TO_WAITING_FOR_MATCH",
		navIcon: "medal",
		logoUrl: MOCK_TOURNAMENT_LOGO_URL,
		subtitle: "In The Zone 42 · Winners round 3",
		waiting: true,
	},
	toCast: {
		state: "TO_WAITING_FOR_CAST",
		navIcon: "medal",
		logoUrl: MOCK_TOURNAMENT_LOGO_URL,
		subtitle: "In The Zone 42 · Match is held for the stream",
		waiting: true,
	},
	toMatch: {
		state: "TO_MATCH",
		navIcon: "medal",
		logoUrl: MOCK_TOURNAMENT_LOGO_URL,
		subtitle: "In The Zone 42 · Winners round 3",
	},
};

export interface MockVoiceParticipant {
	id: number;
	username: string;
	isLocal?: boolean;
	speaking?: boolean;
	muted?: boolean;
	deafened?: boolean;
}

const MOCK_VOICE_PARTICIPANTS: MockVoiceParticipant[] = [
	{ id: 274, username: "Sendou", isLocal: true },
	{ id: 2, username: "hfcRed", speaking: true },
	{ id: 3, username: "julu", muted: true },
	{ id: 4, username: "Xol", muted: true, deafened: true },
];

export const MOCK_VOICE_ROOM_NAME = "SendouQ match #12345";

export const MOCK_INPUT_DEVICES = [
	{ id: "default", name: "Default - USB PnP Audio Device" },
	{ id: "usb", name: "USB PnP Audio Device" },
	{ id: "builtin", name: "MacBook Pro Microphone" },
	{ id: "elgato", name: "Elgato HD60 X (Audio)" },
];

export const MOCK_OUTPUT_DEVICES = [
	{ id: "default", name: "Default - Realtek USB Audio" },
	{ id: "realtek", name: "Realtek USB Audio" },
	{ id: "builtin", name: "MacBook Pro Speakers" },
];

export const MOCK_SCANNER_GAME: {
	mode: ModeShort;
	stageId: StageId;
	score: string;
} = {
	mode: "SZ",
	stageId: 10,
	score: "42 – 67",
};

export const HeaderMockContext = React.createContext<{
	state: HeaderMockState;
	setState: React.Dispatch<React.SetStateAction<HeaderMockState>>;
} | null>(null);

/** Shared mock state of the header test page, the same across every preview frame. */
export function useHeaderMock() {
	const context = React.useContext(HeaderMockContext);
	if (!context) throw new Error("useHeaderMock used outside its provider");

	const { state, setState } = context;
	const update = (partial: Partial<HeaderMockState>) =>
		setState((current) => ({ ...current, ...partial }));

	const updateVoiceSettings = (partial: Partial<MockVoiceSettings>) =>
		setState((current) => ({
			...current,
			voiceSettings: { ...current.voiceSettings, ...partial },
		}));

	return { state, update, updateVoiceSettings };
}

/** Participants with the local user's mic & deafen reflecting the mock state. */
export function voiceParticipants(state: HeaderMockState) {
	return MOCK_VOICE_PARTICIPANTS.map((participant) =>
		participant.isLocal
			? {
					...participant,
					muted: !state.micEnabled || state.deafened,
					deafened: state.deafened,
					speaking: state.pushToTalk && state.micEnabled,
				}
			: participant,
	);
}
