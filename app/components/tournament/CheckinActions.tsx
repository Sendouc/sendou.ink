// TODO: Warning: Text content did not match. Server: "57" Client: "56"
import * as React from "react";
import { Form, useLoaderData, useTransition } from "remix";
import {
  checkInClosesDate,
  TOURNAMENT_TEAM_ROSTER_MIN_SIZE,
} from "~/constants";
import { TournamentAction } from "~/routes/to/$organization.$tournament";
import type { FindTournamentByNameForUrlI } from "~/services/tournament";
import { useUser } from "~/hooks/common";
import { Button } from "../Button";
import { AlertIcon } from "../icons/Alert";
import { CheckInIcon } from "../icons/CheckIn";
import { ErrorIcon } from "../icons/Error";
import { SuccessIcon } from "../icons/Success";
import { ActionSectionWrapper } from "./ActionSectionWrapper";

// TODO: warning when not registered but check in is open
export function CheckinActions() {
  const tournament = useLoaderData<FindTournamentByNameForUrlI>();
  const user = useUser();
  const transition = useTransition();

  const timeInMinutesBeforeCheckInCloses = () => {
    return Math.floor(
      (checkInClosesDate(tournament.startTime).getTime() -
        new Date().getTime()) /
        (1000 * 60)
    );
  };
  const [minutesTillCheckInCloses, setMinutesTillCheckInCloses] =
    React.useState(timeInMinutesBeforeCheckInCloses());

  const ownTeam = tournament.teams.find((team) =>
    team.members.some(
      ({ member, captain }) => captain && member.id === user?.id
    )
  );

  const tournamentHasStarted = tournament.brackets.some((b) => b.rounds.length);
  if (!ownTeam || tournamentHasStarted) {
    return null;
  }

  React.useEffect(() => {
    const timeout = setInterval(() => {
      setMinutesTillCheckInCloses(timeInMinutesBeforeCheckInCloses());
    }, 1000 * 15);

    return () => clearTimeout(timeout);
  }, []);

  if (ownTeam.checkedInTime) {
    return (
      <ActionSectionWrapper icon="success" data-cy="checked-in-alert">
        <SuccessIcon /> Your team is checked in!
      </ActionSectionWrapper>
    );
  }

  const checkInHasStarted = new Date(tournament.checkInStartTime) < new Date();
  const teamHasEnoughMembers =
    ownTeam.members.length >= TOURNAMENT_TEAM_ROSTER_MIN_SIZE;

  if (!checkInHasStarted && !teamHasEnoughMembers) {
    return (
      <ActionSectionWrapper icon="warning" data-cy="team-size-alert">
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
      <ActionSectionWrapper icon="warning" data-cy="not-enough-players-warning">
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
          <input type="hidden" name="teamId" value={ownTeam.id} />
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
