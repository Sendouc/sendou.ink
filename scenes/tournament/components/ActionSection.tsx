import { useData } from "solid-app-router";
import { createMemo, createSignal } from "solid-js";
import { ErrorMessage } from "../../../components/ErrorMessage";
import { trpcClient } from "../../../utils/trpc-client";
import { useForm } from "../../../utils/useForm";
import s from "../styles/ActionSection.module.css";
import type { ITournamentData } from "../TournamentPage.data";

const lengthIsCorrect = ({ value }: { value: string }) => {
  if (value.length >= 2 && value.length <= 40) {
    return;
  }

  return "Team name has to be between 2 and 40 characters long.";
};

const uniqueName =
  (registeredTeamNames: string[]) =>
  ({ value }: { value: string }) => {
    if (!registeredTeamNames.includes(value)) return;
    return `There is already a team called "${value}" registered`;
  };

// TODO: show login action when not logged in
// TODO: show add members action when captain and not started
// TODO: show leave member action when not captain and not started
// TODO: show checkin action when captain and check-in started
// TODO: show report score and other in-game actions when there is a match ongoing
// TODO: outlined when no crucial action, filled when there is?
export function ActionSection() {
  const [expanded, setExpanded] = createSignal(false);
  const [teamName, setTeamName] = createSignal("");
  const [tournament, { refetch }] = useData<ITournamentData>();
  const { validate: _validate, formSubmit: _formSubmit, errors } = useForm();

  const fn = async () => {
    try {
      await trpcClient.mutation("tournament.createTournamentTeam", {
        name: teamName(),
        tournamentId: tournament()!.id,
      });
      // TODO: mutate here?
      refetch();
      setExpanded(false);
    } catch (e) {
      console.error(e);
      // TODO: deal with error
    }
  };

  const registeredTeamNames = createMemo(() =>
    (tournament()?.teams ?? []).map((t) => t.name.trim())
  );

  return (
    <div
      class={s.container}
      classList={{ [s.active]: expanded() }}
      onClick={() => setExpanded(true)}
      tabindex={!expanded() ? "0" : undefined}
      role={!expanded() ? "button" : undefined}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          setExpanded(true);
        }
      }}
    >
      <div class={s.header}>Register now</div>
      {expanded() && (
        <div class={s.content} onKeyDown={(e) => e.stopPropagation()}>
          {/* @ts-expect-error */}
          <form use:_formSubmit={fn}>
            <label for="team-name">Team name</label>
            <input
              name="team-name"
              id="team-name"
              required
              value={teamName()}
              onInput={(e) => setTeamName(e.currentTarget.value)}
              // @ts-expect-error
              use:_validate={[
                lengthIsCorrect,
                uniqueName(registeredTeamNames()),
              ]}
            />
            <ErrorMessage error={errors["team-name"]} />
            <div class={s.buttonsContainer}>
              <button type="submit">Submit</button>
              <button
                class="outlined"
                type="button"
                onClick={() => setExpanded(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
