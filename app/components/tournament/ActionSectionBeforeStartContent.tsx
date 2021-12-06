import * as React from "react";
import { useLoaderData } from "remix";
import {
  checkInClosesDate,
  TOURNAMENT_TEAM_ROSTER_MIN_SIZE,
} from "~/constants";
import type { FindTournamentByNameForUrlI } from "~/services/tournament";
import { Unpacked } from "~/utils";
import { AlertIcon } from "../icons/Alert";
import { ActionSectionWrapper } from "./ActionSectionWrapper";

export function ActionSectionBeforeStartContent({
  ownTeam,
}: {
  ownTeam: Unpacked<FindTournamentByNameForUrlI["teams"]>;
}) {
  const tournament = useLoaderData<FindTournamentByNameForUrlI>();

  const timeInMinutesBeforeCheckInCloses = () => {
    return Math.floor(
      (checkInClosesDate(tournament.startTime).getTime() -
        new Date().getTime()) /
        (1000 * 60)
    );
  };

  const [minutesTillCheckInCloses, setMinutesTillCheckInCloses] =
    React.useState(timeInMinutesBeforeCheckInCloses());

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setMinutesTillCheckInCloses(timeInMinutesBeforeCheckInCloses());
    }, 1000 * 15);

    return () => clearTimeout(timeout);
  }, []);

  if (ownTeam.checkedIn) {
    return (
      <ActionSectionWrapper icon="success">
        <AlertIcon /> Your team is succesfully checked in!
      </ActionSectionWrapper>
    );
  }

  const checkInHasStarted = new Date(tournament.checkInTime) < new Date();
  const teamHasEnoughMembers =
    ownTeam.members.length >= TOURNAMENT_TEAM_ROSTER_MIN_SIZE;

  if (!checkInHasStarted && !teamHasEnoughMembers) {
    return (
      <ActionSectionWrapper icon="warning">
        <AlertIcon /> You need at least 4 players in your roster to play
      </ActionSectionWrapper>
    );
  }

  const differenceInMinutesBetweenCheckInAndStart = Math.floor(
    (new Date(tournament.startTime).getTime() -
      new Date(tournament.checkInTime).getTime()) /
      (1000 * 60)
  );

  if (!checkInHasStarted && teamHasEnoughMembers) {
    return (
      <ActionSectionWrapper icon="info">
        <AlertIcon /> Check-in starts{" "}
        {differenceInMinutesBetweenCheckInAndStart} minutes before the
        tournament starts
      </ActionSectionWrapper>
    );
  }

  if (checkInHasStarted && !teamHasEnoughMembers) {
    return (
      <ActionSectionWrapper icon="warning">
        <AlertIcon /> You need at least 4 players in your roster to play.
        Check-in is open for {minutesTillCheckInCloses} more{" "}
        {minutesTillCheckInCloses > 1 ? "minutes" : "minute"}.
      </ActionSectionWrapper>
    );
  }

  if (checkInHasStarted && teamHasEnoughMembers) {
    return (
      <ActionSectionWrapper icon="warning">
        <button>check-in</button>
      </ActionSectionWrapper>
    );
  }

  console.error(
    "Unexpected combination in ActionSectionBeforeStartContent component"
  );
  return null;
}
