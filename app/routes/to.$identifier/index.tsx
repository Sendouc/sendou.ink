import type { ActionFunction, LinksFunction } from "@remix-run/node";
import { Form, useOutletContext } from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/Button";
import { Main } from "~/components/Main";
import { TOURNAMENT } from "~/constants";
import { db } from "~/db";
import { requireUser } from "~/modules/auth";
import styles from "~/styles/tournament.css";
import { badRequestIfFalsy, parseRequestFormData } from "~/utils/remix";
import { assertUnreachable } from "~/utils/types";
import type { TournamentToolsLoaderData } from "../to.$identifier";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

const tournamentToolsActionSchema = z.union([
  z.object({
    _action: z.literal("TEAM_NAME"),
    name: z.string().min(1).max(TOURNAMENT.TEAM_NAME_MAX_LENGTH),
  }),
  z.object({
    _action: z.literal("POOL"),
  }),
]);

export const action: ActionFunction = async ({ request, params }) => {
  const data = await parseRequestFormData({
    request,
    schema: tournamentToolsActionSchema,
  });
  const user = await requireUser(request);

  const event = badRequestIfFalsy(
    db.tournaments.findByIdentifier(params["identifier"]!)
  );

  // xxx: validate tournament not started

  switch (data._action) {
    case "TEAM_NAME": {
      db.tournaments.addTeam({
        ownerId: user.id,
        name: data.name,
        calendarEventId: event.id,
      });
      break;
    }
    case "POOL": {
      break;
    }
    default: {
      assertUnreachable(data);
    }
  }

  return null;
};

export default function TournamentToolsPage() {
  const data = useOutletContext<TournamentToolsLoaderData>();

  return (
    <Main>
      {data.event.isBeforeStart ? <PrestartControls /> : <>generate map list</>}
    </Main>
  );
}

function PrestartControls() {
  const data = useOutletContext<TournamentToolsLoaderData>();

  // xxx: delete team
  // xxx: rename team or this not different action but backend knows what to do?
  return (
    <Form method="post" className="stack md">
      <section className="tournament__action-section">
        1. Register on{" "}
        <a
          href={data.event.bracketUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {data.event.bracketUrl}
        </a>
        <div className="mt-4">
          <label htmlFor="name">Team name you register with</label>
          <input
            id="name"
            name="name"
            maxLength={TOURNAMENT.TEAM_NAME_MAX_LENGTH}
            defaultValue={data.ownTeam?.name}
            required
          />
          <Button
            tiny
            className="mt-4"
            name="_action"
            value="TEAM_NAME"
            type="submit"
          >
            Submit
          </Button>
        </div>
      </section>
      <section className="tournament__action-section">
        2. Pick map pool
        <div className="tournament__action-side-note">
          You can play without selecting a map pool but then your opponent gets
          to decide what maps get played.
          <Button className="mt-4">Pick</Button>
        </div>
      </section>
      <section className="tournament__action-section">
        3. Submit roster
        <div className="tournament__action-side-note">
          Submitting roster is optional but you might be seeded lower if you
          don&apos;t.
          <Button className="mt-4">Enter roster</Button>
        </div>
      </section>
      <div className="tournament__action-side-note">
        Note: you can change your map pool and roster as many times as you want
        before the tournament starts.
      </div>
    </Form>
  );
}
