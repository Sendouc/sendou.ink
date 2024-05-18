import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Main } from "~/components/Main";
import { SubmitButton } from "~/components/SubmitButton";
import { TEAM_POST_TYPES, LFG, TIMEZONES } from "../lfg-constants";
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
import type { Tables } from "~/db/tables";
import { LinkButton } from "~/components/Button";
import { ArrowLeftIcon } from "~/components/icons/ArrowLeft";
export { loader, action };

export const handle: SendouRouteHandle = {
  i18n: ["lfg"],
  breadcrumb: () => ({
    imgPath: navIconUrl("lfg"),
    href: LFG_PAGE,
    type: "IMAGE",
  }),
};

export default function LFGPage() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const { t } = useTranslation();
  const availableTypes = useAvailablePostTypes();
  const [type, setType] = React.useState(data.postToEdit?.type ?? LFG.types[0]);

  if (availableTypes.length === 0) {
    return (
      <Main halfWidth className="stack items-center">
        <h2 className="text-lg mb-4">You can&apos;t create any more posts</h2>
        <LinkButton to={LFG_PAGE} icon={<ArrowLeftIcon />}>
          Go back
        </LinkButton>
      </Main>
    );
  }

  return (
    <Main halfWidth>
      <h2 className="text-lg mb-4">
        {data.postToEdit ? "Editing LFG post" : "New LFG post"}
      </h2>
      <fetcher.Form className="stack md items-start" method="post">
        {data.postToEdit ? (
          <input type="hidden" name="postId" value={data.postToEdit.id} />
        ) : null}
        <TypeSelect
          type={type}
          setType={setType}
          availableTypes={availableTypes}
        />
        <TimezoneSelect />
        <Textarea />
        <Languages />
        {type !== "COACH_FOR_TEAM" && <WeaponPool />}
        <SubmitButton state={fetcher.state}>{t("actions.submit")}</SubmitButton>
      </fetcher.Form>
    </Main>
  );
}

const useAvailablePostTypes = () => {
  const data = useLoaderData<typeof loader>();

  return (
    LFG.types
      // can't look for a team, if not in one
      .filter((type) => data.team || !TEAM_POST_TYPES.includes(type))
      // can't post two posts of same type
      .filter((type) => !data.userPostTypes.includes(type))
  );
};

function TypeSelect({
  type,
  setType,
  availableTypes,
}: {
  type: Tables["LFGPost"]["type"];
  setType: (type: Tables["LFGPost"]["type"]) => void;
  availableTypes: Tables["LFGPost"]["type"][];
}) {
  const { t } = useTranslation(["lfg"]);
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <Label>Type</Label>
      <select
        name="type"
        value={type}
        onChange={(e) => setType(e.target.value as Tables["LFGPost"]["type"])}
      >
        {availableTypes.map((type) => (
          <option key={type} value={type}>
            {t(`lfg:types.${type}`)}{" "}
            {data.team && TEAM_POST_TYPES.includes(type)
              ? `(${data.team.name})`
              : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

function TimezoneSelect() {
  const data = useLoaderData<typeof loader>();
  const [selected, setSelected] = React.useState(
    data.postToEdit?.timezone ?? TIMEZONES[0],
  );

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
  const data = useLoaderData<typeof loader>();
  const [value, setValue] = React.useState(data.postToEdit?.text ?? "");

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
