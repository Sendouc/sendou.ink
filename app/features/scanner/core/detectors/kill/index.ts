/**
 * KillDetector: parses the kill feed — the "Splatted <name>!" pills stacked
 * bottom-center whenever the POV player splats someone (on the SWS26
 * broadcast: the specced player, so a cast's feed follows camera swaps).
 * Each pill reads as one text line snapped
 * against every language's row template (message.ts): the constant text
 * doubles as confirmation, so a lookalike gate hit emits nothing, and what it
 * leaves over is the splatted player's name. Rows are read bottom-up (newest
 * first) until one is missing, and the top-center match timer is read off the
 * same frame (objective/timer.ts) so kills plot on the game clock in every
 * mode, not only where the counter is parsed.
 */
import { getCV, type Mat } from "../../cv";
import { type GlyphSet, scaleGlyphSet } from "../../glyphs";
import { copyRoi, maxBrightness, meanBrightness, type Roi } from "../../image";
import {
	readMatchTimer,
	timerBoxChecks,
	timerGlyphSets,
} from "../objective/timer";
import type { ScoreboardResources } from "../scoreboard/index";
import { type ParsedName, parseName } from "../scoreboard/names";
import type { DetectedEvent, Detector, GateResult } from "../types";
import { matchKillMessage } from "./message";
import {
	darkProbes,
	GATE_DARK_MAX_MEAN,
	GATE_SKULL_MAX_MEAN,
	GATE_SKULL_MIN_MAX,
	GATE_SKULL_MIN_MEAN,
	GATE_TEXT_MAX_FRACTION,
	GATE_TEXT_MIN_FRACTION,
	GATE_TEXT_MIN_MAX,
	KILL_TEXT_BIN_THRESHOLD,
	KILL_TEXT_READ_HEIGHT,
	MAX_ROWS,
	skullRoi,
	textRoi,
} from "./rois";

export interface KillData {
	/** match timer seconds ("3:06" = 186) off the top-center clock; null when unreadable */
	time: number | null;
	/**
	 * every feed row visible in the frame, bottom row first (index 0 = newest
	 * splat; older rows shift upward), up to MAX_ROWS. A row whose name is
	 * unreadable stays as null so it still counts as a splat.
	 */
	names: (string | null)[];
}

export const KILL_EVENT_TYPE = "Kill";

/**
 * Template fit below this is a lookalike row (fixtures read 0.89-1.0; the
 * garbled reads of a mis-scaled atlas peaked at 0.67).
 */
const MESSAGE_MIN_SCORE = 0.75;

/**
 * parseName's plain-tie margin at feed size: the dot of 'i' alone lands 'í'/
 * 'ì' 0.00-0.03 over 'i' (datkid, Burstie), a blurred 'l' lands 'í' 0.03 over
 * the bar glyphs (leafi), a bracket lands 【 0.015 over '[' ([K]yo) — while a
 * real accent or double stroke ranks the plain form well lower.
 */
const PLAIN_TIE_MARGIN = 0.05;

/** Timeline content guard: repeat frames of one stack merge, a row entering or leaving keeps its own event. */
export function sameKillData(a: unknown, b: unknown): boolean {
	const da = a as KillData;
	const db = b as KillData;
	return (
		da.names.length === db.names.length &&
		da.names.every((name, i) => name === db.names[i])
	);
}

export function createKillDetector(
	resources: ScoreboardResources,
): Detector<KillData> {
	const cv = getCV();
	const glyphs: GlyphSet | null = resources.killFeedGlyphs
		? scaleGlyphSet(
				resources.killFeedGlyphs,
				KILL_TEXT_READ_HEIGHT / resources.killFeedGlyphs.height,
			)
		: null;
	const timerSets = timerGlyphSets(resources);

	function whiteFraction(gray: Mat, roi: Roi): number {
		const crop = copyRoi(gray, roi);
		const bin = new cv.Mat();
		cv.threshold(crop, bin, GATE_TEXT_MIN_MAX, 255, cv.THRESH_BINARY);
		crop.delete();
		const fraction = cv.countNonZero(bin) / (bin.rows * bin.cols);
		bin.delete();
		return fraction;
	}

	/** One row's presence checks: pill interior dark around the line, white skull art, one line of white text. */
	function rowChecks(gray: Mat, row: number): boolean[] {
		const skull = skullRoi(row);
		const skullMean = meanBrightness(gray, skull);
		const text = textRoi(row);
		const textFraction = whiteFraction(gray, text);
		return [
			...darkProbes(row).map(
				(roi) => meanBrightness(gray, roi) <= GATE_DARK_MAX_MEAN,
			),
			skullMean >= GATE_SKULL_MIN_MEAN &&
				skullMean <= GATE_SKULL_MAX_MEAN &&
				maxBrightness(gray, skull) >= GATE_SKULL_MIN_MAX,
			maxBrightness(gray, text) >= GATE_TEXT_MIN_MAX &&
				textFraction >= GATE_TEXT_MIN_FRACTION &&
				textFraction <= GATE_TEXT_MAX_FRACTION,
		];
	}

	function gate(frame: Mat): GateResult {
		const gray = new cv.Mat();
		cv.cvtColor(frame, gray, cv.COLOR_RGBA2GRAY);
		const checks = rowChecks(gray, 0);
		gray.delete();
		const passed = checks.filter(Boolean).length;
		return { pass: passed === checks.length, score: passed / checks.length };
	}

	function readRow(gray: Mat, row: number): ParsedName {
		const band = copyRoi(gray, textRoi(row));
		const parsed = parseName(band, glyphs!, {
			binThreshold: KILL_TEXT_BIN_THRESHOLD,
			spaceGap: Math.max(6, Math.round(glyphs!.medianWidth * 0.55)),
			plainTieMargin: PLAIN_TIE_MARGIN,
		});
		band.delete();
		return parsed;
	}

	function parse(frame: Mat, t: number): DetectedEvent<KillData>[] {
		if (!glyphs) return [];
		const gray = new cv.Mat();
		cv.cvtColor(frame, gray, cv.COLOR_RGBA2GRAY);

		const names: (string | null)[] = [];
		const confidences: number[] = [];
		const rows: Record<string, unknown>[] = [];
		for (let row = 0; row < MAX_ROWS; row++) {
			if (row > 0 && !rowChecks(gray, row).every(Boolean)) break;
			const parsed = readRow(gray, row);
			const message = matchKillMessage(parsed.name);
			rows.push({
				raw: parsed.raw.text,
				read: parsed.name,
				readScore: parsed.confidence,
				messageLangs: message?.template.langs,
				messageScore: message?.score,
			});
			if (!message || message.score < MESSAGE_MIN_SCORE) break;
			names.push(message.name);
			confidences.push((message.score + parsed.confidence) / 2);
		}
		if (names.length === 0) {
			gray.delete();
			return [];
		}

		const timer = timerBoxChecks(gray).every(Boolean)
			? readMatchTimer(gray, timerSets)
			: { value: null, reading: "" };
		gray.delete();

		return [
			{
				type: KILL_EVENT_TYPE,
				t,
				confidence:
					confidences.reduce((sum, c) => sum + c, 0) / confidences.length,
				data: { time: timer.value, names },
				debug: { rows, timerRaw: timer.reading },
			},
		];
	}

	// rows live a few seconds and a stack grows while it shows, so the feed is
	// a long-lived screen with changing content: a fixed cadence instead of
	// steady-frame suppression (a row samples several times before expiring)
	return {
		id: "kill",
		checkIntervalS: 0.5,
		gate,
		parse,
	};
}
