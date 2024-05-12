import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Main } from "~/components/Main";
import { SubmitButton } from "~/components/SubmitButton";
import { INDIVIDUAL_POST_TYPES, LFG, TIMEZONES } from "../lfg-constants";
import * as React from "react";
import { Label } from "~/components/Label";
import type { SendouRouteHandle } from "~/utils/remix";
import {
  LFG_PAGE,
  SENDOUQ_SETTINGS_PAGE,
  navIconUrl,
  userEditProfilePage,
} from "~/utils/urls";
import { FormMessage } from "~/components/FormMessage";
import { WeaponImage } from "~/components/Image";
import { useUser } from "~/features/auth/core/user";

import { loader } from "../loaders/lfg.new.server";
import { action } from "../actions/lfg.new.server";
export { loader, action };

export const handle: SendouRouteHandle = {
  i18n: ["lfg"],
  breadcrumb: () => ({
    imgPath: navIconUrl("lfg"),
    href: LFG_PAGE,
    type: "IMAGE",
  }),
};

// xxx: error handling if trying to pick a type of post they already have

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
        <Languages />
        <WeaponPool />
        <SubmitButton state={fetcher.state}>{t("actions.submit")}</SubmitButton>
      </fetcher.Form>
    </Main>
  );
}

function TypeSelect() {
  const { t } = useTranslation(["lfg"]);
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <Label>Type</Label>
      <select name="type">
        {LFG.types
          .filter((type) => data.team || INDIVIDUAL_POST_TYPES.includes(type))
          .map((type) => (
            <option key={type} value={type}>
              {t(`lfg:types.${type}`)}{" "}
              {data.team && !INDIVIDUAL_POST_TYPES.includes(type)
                ? `(${data.team.name})`
                : ""}
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

// xxx: markdown for patrons?
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

// xxx: hide here + lfgpost component when coach
function WeaponPool() {
  const user = useUser();
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <Label>Weapon pool</Label>
      <div className="stack horizontal sm">
        {data.weaponPool?.map(({ weaponSplId }) => (
          <WeaponImage
            key={weaponSplId}
            weaponSplId={weaponSplId}
            size={32}
            variant="build"
          />
        ))}
      </div>
      <FormMessage type="info">
        Edit on your{" "}
        <Link to={userEditProfilePage(user!)} target="_blank" rel="noreferrer">
          user profile
        </Link>
      </FormMessage>
    </div>
  );
}

function Languages() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <Label>Languages</Label>
      <div className="stack horizontal sm">
        {data.languages?.join(" / ").toUpperCase()}
      </div>
      <FormMessage type="info">
        Edit on{" "}
        <Link to={SENDOUQ_SETTINGS_PAGE} target="_blank" rel="noreferrer">
          SendouQ settings page
        </Link>
      </FormMessage>
    </div>
  );
}
