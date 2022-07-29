import { Form } from "@remix-run/react";
import { Label } from "~/components/Label";
import { Main } from "~/components/Main";
import * as React from "react";
import { CalendarEvent } from "~/db/types";
import { CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH } from "~/constants";

export default function CalendarNewEventPage() {
  return (
    <Main>
      <Form className="stack md" method="post">
        <NameInput />
        <DescriptionTextarea />
      </Form>
    </Main>
  );
}

function NameInput() {
  return (
    <div>
      <Label htmlFor="country" required>
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
