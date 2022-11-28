import { type ActionFunction } from "@remix-run/node";
import { useOutletContext, useSubmit } from "@remix-run/react";
import * as React from "react";
import invariant from "tiny-invariant";
import { z } from "zod";
import { Button } from "~/components/Button";
import { FormMessage } from "~/components/FormMessage";
import { Main } from "~/components/Main";
import { Toggle } from "~/components/Toggle";
import { db } from "~/db";
import { useTranslation } from "~/hooks/useTranslation";
import { requireUser } from "~/modules/auth";
import { canAdminCalendarTOTools } from "~/permissions";
import {
  badRequestIfFalsy,
  parseRequestFormData,
  validate,
} from "~/utils/remix";
import { discordFullName } from "~/utils/strings";
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
  const { t } = useTranslation(["tournament"]);
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
    <Main halfWidth className="stack md">
      <div>
        <label>{t("tournament:admin.eventStarted")}</label>
        <Toggle
          checked={eventStarted}
          setChecked={handleToggle}
          name="started"
        />
        <FormMessage type="info">
          {t("tournament:admin.eventStarted.explanation")}
        </FormMessage>
      </div>
      <div>
        <label>{t("tournament:admin.download")}</label>
        <div className="stack horizontal sm">
          <Button
            tiny
            onClick={() =>
              handleDownload({
                filename: "discord.txt",
                content: discordListContent(data),
              })
            }
          >
            {t("tournament:admin.download.discord")}
          </Button>
        </div>
      </div>
    </Main>
  );
}

function handleDownload({
  content,
  filename,
}: {
  content: string;
  filename: string;
}) {
  const element = document.createElement("a");
  const file = new Blob([content], {
    type: "text/plain",
  });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
}

function discordListContent(data: TournamentToolsLoaderData) {
  return data.teams
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((team) => {
      const owner = team.members.find((user) => user.isOwner);
      invariant(owner);

      return `${team.name} - ${discordFullName(owner)} - <@${owner.discordId}>`;
    })
    .join("\n");
}
