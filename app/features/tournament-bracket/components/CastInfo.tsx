import { useFetcher } from "@remix-run/react";
import { SubmitButton } from "~/components/SubmitButton";
import { useUser } from "~/features/auth/core";
import { useTournament } from "~/features/tournament/routes/to.$id";

// xxx: question mark popup
// xxx: lock & unlock icons
export function CastInfo({
  matchIsOngoing,
  matchId,
  hasBothParticipants,
  matchIsOver,
}: {
  matchIsOngoing: boolean;
  matchId: number;
  hasBothParticipants: boolean;
  matchIsOver: boolean;
}) {
  const user = useUser();
  const tournament = useTournament();

  const castedMatchesInfo = tournament.ctx.castedMatchesInfo;
  const castTwitchAccounts = tournament.ctx.castTwitchAccounts ?? [];
  const currentlyCastedOn = Object.entries(
    castedMatchesInfo?.castedMatches ?? {},
  ).find(([, value]) => value === matchId)?.[0];
  const isLocked = castedMatchesInfo?.lockedMatches?.includes(matchId);

  const hasPerms = tournament.isOrganizerOrStreamer(user);

  if (castTwitchAccounts.length === 0 || !hasPerms || matchIsOver) return null;

  // match has to be locked beforehand, can't be done when both participants are there already
  if (!hasBothParticipants && !isLocked) {
    return (
      <CastInfoWrapper submitButtonText="Lock to be casted" _action="LOCK" />
    );
  }

  // if for some reason match is locked in the DB but also has scores reported then the UI
  // will act as if it's not locked at all
  if (!matchIsOngoing && isLocked) {
    return <CastInfoWrapper submitButtonText="Unlock" _action="UNLOCK" />;
  }

  return (
    <CastInfoWrapper submitButtonText="Save" _action="SET_AS_CASTED">
      <select
        name="twitchAccount"
        id="twitchAccount"
        defaultValue={currentlyCastedOn ?? "null"}
      >
        <option value="null">Not casted</option>
        {castTwitchAccounts.map((account) => (
          <option key={account} value={account}>
            {account}
          </option>
        ))}
      </select>
    </CastInfoWrapper>
  );
}

function CastInfoWrapper({
  children,
  submitButtonText,
  _action,
}: {
  children?: React.ReactNode;
  submitButtonText?: string;
  _action?: string;
}) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form
      className="tournament-bracket__cast-info-container"
      method="post"
    >
      <div className="tournament-bracket__cast-info-container__label">Cast</div>

      <div className="stack horizontal sm items-center justify-between w-full">
        {children ? (
          <div className="tournament-bracket__cast-info-container__content">
            {children}
          </div>
        ) : null}
        {submitButtonText && _action ? (
          <SubmitButton
            className="mr-2"
            state={fetcher.state}
            _action={_action}
          >
            {submitButtonText}
          </SubmitButton>
        ) : null}
      </div>
    </fetcher.Form>
  );
}
