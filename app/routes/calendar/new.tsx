import { Form } from "@remix-run/react";
import { Label } from "~/components/Label";
import { Main } from "~/components/Main";
import * as React from "react";
import type { CalendarEvent } from "~/db/types";
import { CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH } from "~/constants";
import { Button } from "~/components/Button";
import type { LinksFunction } from "@remix-run/node";
import styles from "~/styles/calendar-new.css";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { TrashIcon } from "~/components/icons/Trash";
import { Input } from "~/components/Input";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export default function CalendarNewEventPage() {
  return (
    <Main>
      <Form className="stack md" method="post">
        <NameInput />
        <DescriptionTextarea />
        <DatesInput />
        <DiscordLinkInput />
        <BracketUrlInput />
        {/* <TagsAdder /> */}
        {/* <BadgesAdder /> */}
      </Form>
    </Main>
  );
}

function NameInput() {
  return (
    <div>
      <Label htmlFor="name" required>
        Name
      </Label>
      <input name="name" />
    </div>
  );
}

function DescriptionTextarea({
  initialValue,
}: {
  initialValue?: CalendarEvent["description"];
}) {
  const [value, setValue] = React.useState(initialValue ?? "");

  return (
    <div>
      <Label
        htmlFor="description"
        valueLimits={{
          current: value.length,
          max: CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH,
        }}
      >
        Description
      </Label>
      <textarea
        id="description"
        name="description"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH}
      />
    </div>
  );
}

function DatesInput() {
  const { i18n } = useTranslation();
  const [dateInputValue, setDateInputValue] = React.useState<string>();
  const [dates, setDates] = React.useState<{ date: Date; id: string }[]>([]);

  return (
    <div className="stack md items-start">
      <div>
        <Label htmlFor="date" required>
          Dates
        </Label>
        <div className="stack horizontal sm items-center">
          <input
            id="date"
            type="datetime-local"
            value={dateInputValue ?? ""}
            onChange={(e) => setDateInputValue(e.target.value)}
          />
          <Button
            tiny
            disabled={!dateInputValue}
            onClick={() => {
              setDates(
                [
                  ...dates,
                  {
                    date: new Date(dateInputValue!),
                    id: String(Math.random()),
                  },
                ].sort((a, b) => a.date.getTime() - b.date.getTime())
              );
            }}
          >
            Add date
          </Button>
        </div>
      </div>
      <div className="calendar-new__dates-list">
        {dates.map(({ date, id }, i) => (
          <React.Fragment key={id}>
            <div
              className={clsx("text-lighter", { hidden: dates.length === 1 })}
            >
              Day {i + 1}
            </div>
            <div>
              {date.toLocaleTimeString(i18n.language, {
                hour: "numeric",
                minute: "numeric",
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </div>
            <Button
              onClick={() => setDates(dates.filter((date) => date.id !== id))}
              className="mr-auto"
              icon={<TrashIcon />}
              variant="minimal-destructive"
              aria-label="Remove date"
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function DiscordLinkInput() {
  return (
    <div className="stack items-start">
      <Label htmlFor="discordUrl">Discord server invite URL</Label>
      <Input name="discordUrl" leftAddon="https://discord.gg/" />
    </div>
  );
}

function BracketUrlInput() {
  return (
    <div>
      <Label htmlFor="bracketUrl">Bracket URL</Label>
      <input name="bracketUrl" type="url" />
    </div>
  );
}
