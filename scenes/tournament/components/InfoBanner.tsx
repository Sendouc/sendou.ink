import { Show } from "solid-js";
import { DiscordIcon } from "../../../components/icons/Discord";
import { TwitterIcon } from "../../../components/icons/Twitter";
import { useTournamentData } from "../TournamentPage.data";
import s from "../styles/InfoBanner.module.css";

export function InfoBanner() {
  const tournament = useTournamentData();

  // TODO: skeleton
  return (
    <>
      <Show when={tournament()} fallback={null}>
        {(tournament) => (
          <div
            class={s.container}
            style={{
              "--background": tournament.bannerBackground,
              "--text": `hsl(${tournament.bannerTextHSLArgs})`,
              "--text-transparent": `hsla(${tournament.bannerTextHSLArgs}, 0.3)`,
            }}
          >
            <div class={s.topRow}>
              <div class={s.dateName}>
                <div class={s.monthDate}>
                  <div class={s.month}>
                    {shortMonthName(tournament.startTime)}
                  </div>
                  <div class={s.date}>{dayNumber(tournament.startTime)}</div>
                </div>
                <div class={s.tournamentName}>{tournament.name}</div>
              </div>
              <div class={s.iconButtons}>
                {tournament.organizer.twitter && (
                  <a class={s.iconButton} href={tournament.organizer.twitter}>
                    <TwitterIcon />
                  </a>
                )}
                <a
                  class={s.iconButton}
                  href={tournament.organizer.discordInvite}
                >
                  <DiscordIcon />
                </a>
              </div>
            </div>
            <div class={s.bottomRow}>
              <div class={s.infos}>
                <div class={s.infoContainer}>
                  <div class={s.infoLabel}>Starting time</div>
                  <div>{weekdayAndStartTime(tournament.startTime)}</div>
                </div>
                <div class={s.infoContainer}>
                  <div class={s.infoLabel}>Format</div>
                  <div>Double Elimination</div>
                </div>
                <div class={s.infoContainer}>
                  <div class={s.infoLabel}>Organizer</div>
                  <div>{tournament.organizer.name}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Show>
    </>
  );
}

function weekdayAndStartTime(date: Date) {
  return new Date(date).toLocaleString("en-US", {
    weekday: "long",
    hour: "numeric",
  });
}

function shortMonthName(date: Date) {
  return new Date(date).toLocaleString("en-US", { month: "short" });
}

function dayNumber(date: Date) {
  return new Date(date).toLocaleString("en-US", { day: "numeric" });
}
