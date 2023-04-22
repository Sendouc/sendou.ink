import type { LoaderArgs, ActionFunction } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import * as React from "react";
import invariant from "tiny-invariant";
import { z } from "zod";
import { Button } from "~/components/Button";
import { FormMessage } from "~/components/FormMessage";
import { Toggle } from "~/components/Toggle";
import { useTranslation } from "~/hooks/useTranslation";
import { canAdminCalendarTOTools } from "~/permissions";
import { notFoundIfFalsy, parseRequestFormData, validate } from "~/utils/remix";
import { discordFullName } from "~/utils/strings";
import { checkboxValueToBoolean } from "~/utils/zod";
import { findByIdentifier } from "../queries/findByIdentifier.server";
import { findTeamsByEventId } from "../queries/findTeamsByEventId.server";
import { updateIsBeforeStart } from "../queries/updateIsBeforeStart.server";
import { requireUserId } from "~/modules/auth/user.server";
import { idFromParams } from "../tournament-utils";

const tournamentToolsActionSchema = z.object({
  started: z.preprocess(checkboxValueToBoolean, z.boolean()),
});

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUserId(request);
  const data = await parseRequestFormData({
    request,
    schema: tournamentToolsActionSchema,
  });

  const eventId = idFromParams(params);
  const event = notFoundIfFalsy(findByIdentifier(eventId));

  validate(canAdminCalendarTOTools({ user, event }));

  updateIsBeforeStart({
    id: event.id,
    isBeforeStart: Number(!data.started),
  });

  return null;
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const user = await requireUserId(request);
  const eventId = idFromParams(params);

  const event = notFoundIfFalsy(findByIdentifier(eventId));
  notFoundIfFalsy(canAdminCalendarTOTools({ user, event }));

  // could also get these from the layout page
  // but getting them again for the most fresh data
  return {
    event,
    teams: findTeamsByEventId(event.id),
  };
};

export default function TournamentToolsAdminPage() {
  const { t } = useTranslation(["tournament"]);
  const submit = useSubmit();
  const data = useLoaderData<typeof loader>();
  const [eventStarted, setEventStarted] = React.useState(
    Boolean(!data.event.isBeforeStart)
  );

  function handleToggle(toggled: boolean) {
    setEventStarted(toggled);

    const data = new FormData();
    data.append("started", toggled ? "on" : "off");

    submit(data, { method: "post" });
  }

  function discordListContent() {
    return data.teams
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((team) => {
        const owner = team.members.find((user) => user.isOwner);
        invariant(owner);

        return `${team.name} - ${discordFullName(owner)} - <@${
          owner.discordId
        }>`;
      })
      .join("\n");
  }

  return (
    <div className="stack md half-width">
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
            size="tiny"
            onClick={() =>
              handleDownload({
                filename: "discord.txt",
                content: discordListContent(),
              })
            }
          >
            {t("tournament:admin.download.discord")}
          </Button>
        </div>
      </div>
    </div>
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
