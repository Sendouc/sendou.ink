import { type ActionFunction } from "@remix-run/node";
import { useOutletContext, useSubmit } from "@remix-run/react";
import * as React from "react";
import { z } from "zod";
import { FormMessage } from "~/components/FormMessage";
import { Main } from "~/components/Main";
import { Toggle } from "~/components/Toggle";
import { db } from "~/db";
import { requireUser } from "~/modules/auth";
import { canAdminCalendarTOTools } from "~/permissions";
import {
  badRequestIfFalsy,
  parseRequestFormData,
  validate,
} from "~/utils/remix";
import { checkboxValueToBoolean } from "~/utils/zod";
import type { TournamentToolsLoaderData } from "../to.$identifier";

const tournamentToolsActionSchema = z.object({
  started: z.preprocess(checkboxValueToBoolean, z.boolean()),
});

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUser(request);
  const data = await parseRequestFormData({
    request,
    schema: tournamentToolsActionSchema,
  });

  const eventId = params["identifier"]!;
  const event = badRequestIfFalsy(db.tournaments.findByIdentifier(eventId));

  validate(canAdminCalendarTOTools({ user, event }));

  db.tournaments.updateIsBeforeStart({
    id: event.id,
    isBeforeStart: Number(!data.started),
  });

  return null;
};

export default function TournamentToolsAdminPage() {
  const submit = useSubmit();
  const data = useOutletContext<TournamentToolsLoaderData>();
  const [eventStarted, setEventStarted] = React.useState(
    Boolean(!data.event.isBeforeStart)
  );

  function handleToggle(toggled: boolean) {
    setEventStarted(toggled);

    const data = new FormData();
    data.append("started", toggled ? "on" : "off");

    submit(data, { method: "post" });
  }

  return (
    <Main halfWidth>
      <div>
        <label>Event started</label>
        <Toggle
          checked={eventStarted}
          setChecked={handleToggle}
          name="started"
        />
        <FormMessage type="info">
          After start teams can generate map lists but won&apos;t be able to
          edit their map pools or rosters.
        </FormMessage>
      </div>
    </Main>
  );
}
