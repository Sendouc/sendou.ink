import * as AvailabilityRepository from "../AvailabilityRepository.server";
import type { TimeRange } from "../availability-types";
import * as Commitments from "./Commitments.server";

/**
 * Reported weeks and busy blocks overlapping the window, of those of `userIds` who share their
 * schedule with the viewer. Every read of other users' schedules goes through here so the
 * visibility rule is applied in one place; a user left out looks like one who never filled the
 * week in. `excludeTournamentId` keeps that tournament's own registrations from counting as busy.
 */
export async function findByUserIds({
	userIds,
	viewerId,
	startsAt,
	endsAt,
	excludeTournamentId,
}: TimeRange & {
	userIds: Array<number>;
	viewerId: number;
	excludeTournamentId?: number;
}) {
	const visibleUserIds =
		await AvailabilityRepository.findScheduleVisibleUserIds({
			userIds,
			viewerId,
		});

	const [reportedWeeks, busyByUserId] = await Promise.all([
		AvailabilityRepository.findAllWeeksByUserIds({
			userIds: visibleUserIds,
			startsAt,
			endsAt,
		}),
		Commitments.busyBlocksByUserIds({
			userIds: visibleUserIds,
			startsAt,
			endsAt,
			excludeTournamentId,
		}),
	]);

	return { reportedWeeks, busyByUserId };
}
