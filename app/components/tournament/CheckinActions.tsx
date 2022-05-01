// TODO: Warning: Text content did not match. Server: "57" Client: "56"
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import * as React from "react";
import {
  TournamentAction,
  TournamentLoaderData,
} from "~/routes/to/$organization.$tournament";
import { Button } from "../Button";
import { AlertIcon } from "../icons/Alert";
import { CheckInIcon } from "../icons/CheckIn";
import { ErrorIcon } from "../icons/Error";
import { SuccessIcon } from "../icons/Success";
import { ActionSectionWrapper } from "./ActionSectionWrapper";

// TODO: warning when not registered but check in is open
export function CheckinActions() {
  const data = useLoaderData<TournamentLoaderData>();
  const transition = useTransition();

  const timeInMinutesBeforeCheckInCloses = React.useCallback(() => {
    return Math.floor(
      (data.checkIn.endTimestamp - new Date().getTime()) / (1000 * 60)
    );
  }, [data.checkIn.endTimestamp]);
  const [minutesTillCheckInCloses, setMinutesTillCheckInCloses] =
    React.useState(timeInMinutesBeforeCheckInCloses());

  React.useEffect(() => {
    const timeout = setInterval(() => {
      setMinutesTillCheckInCloses(timeInMinutesBeforeCheckInCloses());
    }, 1000 * 15);

    return () => clearTimeout(timeout);
  }, []);

  if (data.membershipStatus !== "CAPTAIN" || !data.bracketId) {
    return null;
  }

  if (data.checkIn.checkedIn) {
    return (
      <ActionSectionWrapper icon="success" data-cy="checked-in-alert">
        <SuccessIcon /> Your team is checked in!
      </ActionSectionWrapper>
    );
  }

  const checkInHasStarted = new Date(data.checkIn.startTimestamp) < new Date();

  if (!checkInHasStarted && !data.checkIn.enoughPlayers) {
    return (
      <ActionSectionWrapper icon="warning" data-cy="team-size-alert">
        <AlertIcon /> You need at least 4 players in your roster to play
      </ActionSectionWrapper>
    );
  }

  if (!checkInHasStarted && data.checkIn.enoughPlayers) {
    return (
      <ActionSectionWrapper icon="info">
        <AlertIcon /> Check-in starts at{" "}
        {new Date(data.checkIn.startTimestamp).toLocaleString("en")}
      </ActionSectionWrapper>
    );
  }

  if (
    checkInHasStarted &&
    !data.checkIn.enoughPlayers &&
    minutesTillCheckInCloses > 0
  ) {
    return (
      <ActionSectionWrapper icon="warning" data-cy="not-enough-players-warning">
        <AlertIcon /> You need at least 4 players in your roster to play.
        Check-in is open for {minutesTillCheckInCloses} more{" "}
        {minutesTillCheckInCloses > 1 ? "minutes" : "minute"}
      </ActionSectionWrapper>
    );
  }

  if (
    checkInHasStarted &&
    data.checkIn.enoughPlayers &&
    minutesTillCheckInCloses > 0
  ) {
    return (
      <ActionSectionWrapper
        icon={minutesTillCheckInCloses <= 1 ? "warning" : "info"}
        data-cy="check-in-alert"
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
        <Form
          method="post"
          className="tournament__action-section__button-container"
        >
          <input
            type="hidden"
            name="_action"
            value={TournamentAction.CHECK_IN}
          />
          <Button
            variant="outlined"
            type="submit"
            loading={transition.state !== "idle"}
            icon={<CheckInIcon />}
            data-cy="check-in-button"
          >
            Check-in
          </Button>
        </Form>
      </ActionSectionWrapper>
    );
  }

  return (
    <ActionSectionWrapper icon="error">
      <ErrorIcon /> Check-in has closed. Your team is not checked in
    </ActionSectionWrapper>
  );
}
