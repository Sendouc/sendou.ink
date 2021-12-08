import * as React from "react";
import { useFetcher, useLoaderData } from "remix";
import {
  checkInClosesDate,
  TOURNAMENT_TEAM_ROSTER_MIN_SIZE,
} from "~/constants";
import type { FindTournamentByNameForUrlI } from "~/services/tournament";
import { Unpacked } from "~/utils";
import { Button } from "../Button";
import { AlertIcon } from "../icons/Alert";
import { ErrorIcon } from "../icons/Error";
import { SuccessIcon } from "../icons/Success";
import { MyForm } from "../MyForm";
import { ActionSectionWrapper } from "./ActionSectionWrapper";

export function ActionSectionBeforeStartContent({
  ownTeam,
}: {
  ownTeam: Unpacked<FindTournamentByNameForUrlI["teams"]>;
}) {
  const fetcher = useFetcher();
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
    const timeout = setInterval(() => {
      setMinutesTillCheckInCloses(timeInMinutesBeforeCheckInCloses());
    }, 1000 * 15);

    return () => clearTimeout(timeout);
  }, []);

  if (ownTeam.checkedInTime) {
    return (
      <ActionSectionWrapper icon="success">
        <SuccessIcon /> Your team is checked in!
      </ActionSectionWrapper>
    );
  }

  const checkInHasStarted = new Date(tournament.checkInStartTime) < new Date();
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
      new Date(tournament.checkInStartTime).getTime()) /
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

  if (
    checkInHasStarted &&
    !teamHasEnoughMembers &&
    minutesTillCheckInCloses > 0
  ) {
    return (
      <ActionSectionWrapper icon="warning">
        <AlertIcon /> You need at least 4 players in your roster to play.
        Check-in is open for {minutesTillCheckInCloses} more{" "}
        {minutesTillCheckInCloses > 1 ? "minutes" : "minute"}
      </ActionSectionWrapper>
    );
  }

  if (
    checkInHasStarted &&
    teamHasEnoughMembers &&
    minutesTillCheckInCloses > 0
  ) {
    return (
      <ActionSectionWrapper
        icon={minutesTillCheckInCloses <= 1 ? "warning" : "info"}
      >
        {minutesTillCheckInCloses > 1 ? (
          <>
            <AlertIcon /> Check-in is open for {minutesTillCheckInCloses} more
            minutes
          </>
        ) : (
          <>
            <AlertIcon /> Check-in closes in less than a minute
          </>
        )}
        <MyForm
          action={`/api/tournament/${ownTeam.id}/check-in`}
          className="tournament__action-section__button-container"
          fetcher={fetcher}
        >
          <Button
            variant="outlined"
            loadingText="Checking in..."
            type="submit"
            loading={fetcher.state !== "idle"}
          >
            Check-in
          </Button>
        </MyForm>
      </ActionSectionWrapper>
    );
  }

  return (
    <ActionSectionWrapper icon="error">
      <ErrorIcon /> Check-in has closed. Your team is not checked in
    </ActionSectionWrapper>
  );
}
