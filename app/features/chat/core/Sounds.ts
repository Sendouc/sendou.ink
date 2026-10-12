import { logger } from "~/utils/logger";
import { soundPath } from "~/utils/urls";

const MAX_START_DELAY_MS = 3_000;

let currentAudio: HTMLAudioElement | null = null;

export function localStorageKey(soundCode: string) {
	return `settings__sound-enabled__${soundCode}`;
}

export function isEnabled(soundCode: string) {
	const stored = localStorage.getItem(localStorageKey(soundCode));

	return !stored || stored === "true";
}

export function play(soundCode: string) {
	if (!isEnabled(soundCode)) return;

	playIgnoringSetting(soundCode);
}

/** Plays regardless of the user's setting (e.g. volume preview); cuts off any sound already playing. */
export function playIgnoringSetting(soundCode: string) {
	currentAudio?.pause();

	const audio = new Audio(soundPath(soundCode));
	currentAudio = audio;
	// silent until it actually starts, so a held back sound can be dropped before it's heard
	audio.volume = 0;

	const requestedAt = Date.now();
	audio.addEventListener(
		"playing",
		() => {
			if (Date.now() - requestedAt > MAX_START_DELAY_MS) {
				audio.pause();
				return;
			}

			audio.volume = volume() / 100;
		},
		{ once: true },
	);

	void audio.play().catch((err) => {
		if (err instanceof DOMException && err.name === "AbortError") return;

		logger.error(`Couldn't play sound: ${err}`);
	});
}

export function volume() {
	const stored = localStorage.getItem("settings__sound-volume");

	return stored ? Number.parseFloat(stored) : 100;
}
