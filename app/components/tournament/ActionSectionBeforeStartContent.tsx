import * as React from "react";
import { useLoaderData, useLocation } from "remix";
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
  const tournament = useLoaderData<FindTournamentByNameForUrlI>();
  const location = useLocation();

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

  if (ownTeam.checkedIn) {
    return (
      <ActionSectionWrapper icon="success">
        <SuccessIcon /> Your team is succesfully checked in!
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
          action={`${location.pathname.split("/").slice(0, 4).join("/")}/api/${
            ownTeam.id
          }/check-in`}
          className="tournament__action-section__button-container"
        >
          <Button variant="outlined" loadingText="Checking-in..." type="submit">
            Check-in
          </Button>
        </MyForm>
      </ActionSectionWrapper>
    );
  }

  return (
    <ActionSectionWrapper icon="error">
      <ErrorIcon /> Check-in has closed
    </ActionSectionWrapper>
  );
}
