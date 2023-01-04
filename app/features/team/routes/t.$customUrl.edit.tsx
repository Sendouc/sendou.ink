import {
  type LoaderArgs,
  redirect,
  type ActionFunction,
} from "@remix-run/node";
import * as React from "react";
import { Form, useLoaderData } from "@remix-run/react";
import { FormMessage } from "~/components/FormMessage";
import { Label } from "~/components/Label";
import { Main } from "~/components/Main";
import { SubmitButton } from "~/components/SubmitButton";
import { useTranslation } from "~/hooks/useTranslation";
import { requireUser } from "~/modules/auth";
import {
  notFoundIfFalsy,
  parseRequestFormData,
  type SendouRouteHandle,
  validate,
} from "~/utils/remix";
import { mySlugify, teamPage } from "~/utils/urls";
import { edit } from "../queries/edit.server";
import { findByIdentifier } from "../queries/findByIdentifier.server";
import { TEAM } from "../team-constants";
import { editTeamSchema, teamParamsSchema } from "../team-schemas.server";
import { isTeamOwner } from "../team-utils";
import { FormErrors } from "~/components/FormErrors";

export const handle: SendouRouteHandle = {
  i18n: ["team"],
  // breadcrumb: () => ({
  //   imgPath: navIconUrl("object-damage-calculator"),
  //   href: OBJECT_DAMAGE_CALCULATOR_URL,
  //   type: "IMAGE",
  // }),
};

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUser(request);
  const { customUrl } = teamParamsSchema.parse(params);

  const team = notFoundIfFalsy(findByIdentifier(customUrl));

  validate(isTeamOwner({ team, user }));

  const data = await parseRequestFormData({
    request,
    schema: editTeamSchema,
  });

  const newCustomUrl = mySlugify(data.name);
  const existingTeam = findByIdentifier(newCustomUrl);

  // can't take someone else's custom url
  if (existingTeam && existingTeam.id !== team.id) {
    return {
      errors: ["forms.errors.duplicateName"],
    };
  }

  const editedTeam = edit({
    id: team.id,
    customUrl: newCustomUrl,
    ...data,
  });

  return redirect(teamPage(editedTeam.customUrl));
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const user = await requireUser(request);
  const { customUrl } = teamParamsSchema.parse(params);

  const team = notFoundIfFalsy(findByIdentifier(customUrl));

  if (!isTeamOwner({ team, user })) {
    throw redirect(teamPage(customUrl));
  }

  return { team };
};

export default function EditTeamPage() {
  const { t } = useTranslation(["common"]);

  return (
    <Main className="half-width">
      <Form method="post" className="stack md items-start">
        <NameInput />
        <TwitterInput />
        <BioTextarea />
        <SubmitButton className="mt-4">
          {t("common:actions.submit")}
        </SubmitButton>
        <FormErrors namespace="team" />
      </Form>
    </Main>
  );
}

function NameInput() {
  const { t } = useTranslation(["common", "team"]);
  const { team } = useLoaderData<typeof loader>();

  return (
    <div>
      <Label htmlFor="title" required>
        {t("common:forms.name")}
      </Label>
      <input
        name="name"
        required
        minLength={TEAM.NAME_MIN_LENGTH}
        maxLength={TEAM.NAME_MAX_LENGTH}
        defaultValue={team.name}
      />
      <FormMessage type="info">{t("team:forms.info.name")}</FormMessage>
    </div>
  );
}

function TwitterInput() {
  const { t } = useTranslation(["team"]);
  const { team } = useLoaderData<typeof loader>();

  return (
    <div>
      <Label htmlFor="title" required>
        {t("team:forms.fields.teamTwitter")}
      </Label>
      <input
        name="twitter"
        required
        maxLength={TEAM.TWITTER_MAX_LENGTH}
        defaultValue={team.twitter}
      />
    </div>
  );
}

function BioTextarea() {
  const { t } = useTranslation(["team"]);
  const { team } = useLoaderData<typeof loader>();
  const [value, setValue] = React.useState(team.bio ?? "");

  return (
    <div className="u-edit__bio-container">
      <Label
        htmlFor="bio"
        valueLimits={{ current: value.length, max: TEAM.BIO_MAX_LENGTH }}
      >
        {t("team:forms.fields.bio")}
      </Label>
      <textarea
        id="bio"
        name="bio"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={TEAM.BIO_MAX_LENGTH}
      />
    </div>
  );
}
