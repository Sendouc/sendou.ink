import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Main } from "~/components/Main";
import { db } from "~/db";
import styles from "~/styles/tournament.css";
import { notFoundIfFalsy } from "~/utils/remix";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const loader = ({ params }: LoaderArgs) => {
  return {
    event: notFoundIfFalsy(
      db.tournaments.findByIdentifier(params["identifier"]!)
    ),
  };
};

export default function TournamentToolsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <Main className="stack md">
      <section className="tournament__action-section">
        1. Register on{" "}
        <a
          href={data.event.bracketUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {data.event.bracketUrl}
        </a>
      </section>
      <section className="tournament__action-section">
        2. Pick map pool
        <div className="tournament__action-side-note">
          You can play without selecting a map pool but then your opponent get
          to decide what maps get played.
        </div>
      </section>
      <section className="tournament__action-section">
        3. Submit roster
        <div className="tournament__action-side-note">
          Submitting roster is optional but you might be seeded lower if you
          don&apos;t.
        </div>
      </section>
      <div className="tournament__action-side-note">
        Note: you can change your map pool and roster as many times as you want
        before the tournament starts.
      </div>
    </Main>
  );
}
