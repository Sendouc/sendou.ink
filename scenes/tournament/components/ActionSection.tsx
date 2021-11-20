import { createMemo, createSignal } from "solid-js";
import { ErrorMessage } from "../../../components/ErrorMessage";
import { trpcClient } from "../../../utils/trpc-client";
import { useForm } from "../../../utils/useForm";
import s from "../styles/ActionSection.module.css";
import { useTournamentData } from "../TournamentPage.data";

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

export function ActionSection() {
  const [expanded, setExpanded] = createSignal(false);
  const tournament = useTournamentData();
  const { validate: _validate, formSubmit: _formSubmit, errors } = useForm();

  const fn = (form: HTMLFormElement) => {
    return trpcClient.mutation("tournament.createTournamentTeam", {
      name: "Team Olive",
      tournamentId: 1,
    });
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
