import { useFetcher } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Main } from "~/components/Main";
import { SubmitButton } from "~/components/SubmitButton";
import { LFG, TIMEZONES } from "../lfg-constants";
import * as React from "react";
import { Label } from "~/components/Label";

import { action } from "../actions/lfg.new.server";
export { action };

// xxx: weaponPool + tell where to change
// xxx: languages + tell where to change

export default function LFGPage() {
  const fetcher = useFetcher();
  const { t } = useTranslation();

  return (
    <Main halfWidth>
      <h2 className="text-lg mb-4">New LFG post</h2>
      <fetcher.Form className="stack md items-start" method="post">
        <TypeSelect />
        <TimezoneSelect />
        <Textarea />
        <SubmitButton state={fetcher.state}>{t("actions.submit")}</SubmitButton>
      </fetcher.Form>
    </Main>
  );
}

// xxx: i18n
// xxx: filter team if no team + show team in the name
function TypeSelect() {
  return (
    <div>
      <Label>Type</Label>
      <select name="type">
        {LFG.types.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </div>
  );
}

function TimezoneSelect() {
  const [selected, setSelected] = React.useState(TIMEZONES[0]);

  React.useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!TIMEZONES.includes(timezone)) return;

    setSelected(timezone);
  }, []);

  return (
    <div>
      <Label>Timezone</Label>
      <select
        name="timezone"
        onChange={(e) => setSelected(e.target.value)}
        value={selected}
      >
        {TIMEZONES.map((tz) => (
          <option key={tz} value={tz}>
            {tz}
          </option>
        ))}
      </select>
    </div>
  );
}

function Textarea() {
  const initialValue = undefined;
  const [value, setValue] = React.useState(initialValue ?? "");

  return (
    <div>
      <Label
        htmlFor="postText"
        valueLimits={{ current: value.length, max: LFG.MAX_TEXT_LENGTH }}
      >
        Text
      </Label>
      <textarea
        id="postText"
        name="postText"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={LFG.MAX_TEXT_LENGTH}
        required
      />
    </div>
  );
}
