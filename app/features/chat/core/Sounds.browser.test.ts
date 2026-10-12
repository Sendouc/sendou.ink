import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { logger } from "~/utils/logger";
import * as Sounds from "./Sounds";

class FakeAudio extends EventTarget {
	static instances: FakeAudio[] = [];

	static playError: Error | null = null;

	volume = 1;
	paused = true;

	constructor() {
		super();
		FakeAudio.instances.push(this);
	}

	play() {
		this.paused = false;
		return FakeAudio.playError
			? Promise.reject(FakeAudio.playError)
			: Promise.resolve();
	}

	pause() {
		this.paused = true;
	}

	/** The browser actually starting the playback, which it may hold back e.g. in a never-shown tab. */
	start() {
		this.dispatchEvent(new Event("playing"));
	}
}

describe("Sounds.play", () => {
	beforeEach(() => {
		FakeAudio.instances = [];
		FakeAudio.playError = null;
		vi.stubGlobal("Audio", FakeAudio);
		localStorage.clear();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	test("cuts off the previous sound when a new one plays", () => {
		Sounds.play("sq_ready-check");
		Sounds.play("sq_match");

		const [previous, latest] = FakeAudio.instances;
		expect(previous.paused).toBe(true);
		expect(latest.paused).toBe(false);
	});

	test("plays at the set volume once the sound starts", () => {
		localStorage.setItem("settings__sound-volume", "50");
		Sounds.play("sq_match");
		const [audio] = FakeAudio.instances;

		audio.start();

		expect(audio.volume).toBe(0.5);
		expect(audio.paused).toBe(false);
	});

	test("drops a sound the browser starts long after it was requested", () => {
		vi.useFakeTimers();
		Sounds.play("sq_match");
		const [audio] = FakeAudio.instances;

		vi.advanceTimersByTime(60_000);
		audio.start();

		expect(audio.volume).toBe(0);
		expect(audio.paused).toBe(true);
	});

	test.each([
		{ why: "unexpected error", error: new Error("boom"), logged: 1 },
		{
			why: "abort from a newer sound cutting it off",
			error: new DOMException("", "AbortError"),
			logged: 0,
		},
	])("play failure logging: $why", async ({ error, logged }) => {
		const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
		FakeAudio.playError = error;

		Sounds.play("sq_match");
		await new Promise((resolve) => setTimeout(resolve));

		expect(errorSpy).toHaveBeenCalledTimes(logged);
	});
});
