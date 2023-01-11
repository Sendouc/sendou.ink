import type {
  LinksFunction,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import {
  type LoaderArgs,
  redirect,
  type ActionFunction,
} from "@remix-run/node";
import * as React from "react";
import { Form, Link, useLoaderData } from "@remix-run/react";
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
import {
  mySlugify,
  navIconUrl,
  teamPage,
  TEAM_SEARCH_PAGE,
  uploadImagePage,
} from "~/utils/urls";
import { edit } from "../queries/edit.server";
import { findByIdentifier } from "../queries/findByIdentifier.server";
import { TEAM } from "../team-constants";
import { editTeamSchema, teamParamsSchema } from "../team-schemas.server";
import { isTeamOwner } from "../team-utils";
import { FormErrors } from "~/components/FormErrors";
import { FormWithConfirm } from "~/components/FormWithConfirm";
import { deleteTeam } from "../queries/deleteTeam.server";
import { Button } from "~/components/Button";
import { assertUnreachable } from "~/utils/types";
import styles from "../team.css";
import { makeTitle } from "~/utils/strings";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = ({
  data,
}: {
  data: SerializeFrom<typeof loader>;
}) => {
  if (!data) return {};

  return {
    title: makeTitle(data.team.name),
  };
};

export const handle: SendouRouteHandle = {
  i18n: ["team"],
  breadcrumb: ({ match }) => {
    const data = match.data as SerializeFrom<typeof loader>;
    return [
      {
        imgPath: navIconUrl("t"),
        href: TEAM_SEARCH_PAGE,
        type: "IMAGE",
      },
      {
        text: data.team.name,
        href: teamPage(data.team.customUrl),
        type: "TEXT",
      },
    ];
  },
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

  switch (data._action) {
    case "DELETE": {
      deleteTeam(team.id);

      return redirect(TEAM_SEARCH_PAGE);
    }
    case "EDIT": {
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
    }
    default: {
      assertUnreachable(data);
    }
  }
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
  const { t } = useTranslation(["common", "team"]);
  const { team } = useLoaderData<typeof loader>();

  return (
    <Main className="half-width">
      <FormWithConfirm
        dialogHeading={t("team:deleteTeam.header", { teamName: team.name })}
        fields={[["_action", "DELETE"]]}
      >
        <Button className="ml-auto" variant="minimal-destructive">
          {t("team:actionButtons.deleteTeam")}
        </Button>
      </FormWithConfirm>
      <Form method="post" className="stack md items-start">
        <ImageUploadLinks />
        <NameInput />
        <TwitterInput />
        <BioTextarea />
        <SubmitButton className="mt-4" _action="EDIT">
          {t("common:actions.submit")}
        </SubmitButton>
        <FormErrors namespace="team" />
      </Form>
    </Main>
  );
}

function ImageUploadLinks() {
  const { t } = useTranslation(["team"]);
  return (
    <div>
      <Label>{t("team:forms.fields.uploadImages")}</Label>
      <ol className="team__image-links-list">
        <li>
          <Link to={uploadImagePage("team-pfp")}>
            {t("team:forms.fields.uploadImages.pfp")}
          </Link>
        </li>
        <li>
          <Link to={uploadImagePage("team-banner")}>
            {t("team:forms.fields.uploadImages.banner")}
          </Link>
        </li>
      </ol>
    </div>
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
      <Label htmlFor="title">{t("team:forms.fields.teamTwitter")}</Label>
      <input
        name="twitter"
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
