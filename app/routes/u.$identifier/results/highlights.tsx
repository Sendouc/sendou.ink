import { type ActionFunction, redirect } from "@remix-run/node";
import { Form, useMatches, useTransition } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import invariant from "tiny-invariant";
import { z } from "zod";
import { Button } from "~/components/Button";
import { FormErrors } from "~/components/FormErrors";
import { Main } from "~/components/Main";
import { db } from "~/db";
import { requireUser } from "~/modules/auth";
import { type UserPageLoaderData } from "~/routes/u.$identifier";
import { normalizeFormFieldArray } from "~/utils/arrays";
import { parseRequestFormData } from "~/utils/remix";
import { userResultsPage } from "~/utils/urls";
import {
  HIGHLIGHT_CHECKBOX_NAME,
  UserResultsTable,
} from "./components/UserResultsTable";

const editHighlightsActionSchema = z.object({
  [HIGHLIGHT_CHECKBOX_NAME]: z.optional(
    z.union([z.array(z.string()), z.string()])
  ),
});

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  const data = await parseRequestFormData({
    request,
    schema: editHighlightsActionSchema,
  });

  const resultTeamIds = normalizeFormFieldArray(
    data[HIGHLIGHT_CHECKBOX_NAME]
  ).map((id) => parseInt(id, 10));

  db.users.updateResultHighlights({
    userId: user.id,
    resultTeamIds,
  });

  return redirect(userResultsPage(user));
};

export default function ResultHighlightsEditPage() {
  const { t } = useTranslation(["common", "user"]);
  const [, parentRoute] = useMatches();
  const transition = useTransition();

  invariant(parentRoute);
  const userPageData = parentRoute.data as UserPageLoaderData;

  return (
    <Main>
      <Form method="post" className="stack md items-start">
        <h2 className="text-start">{t("user:results.highlights.choose")}</h2>
        <div className="u__results-table-wrapper">
          <fieldset className="u__results-table-highlights">
            <legend>{t("user:results.highlights.explanation")}</legend>
            <UserResultsTable
              id="user-results-highlight-selection"
              results={userPageData.results}
              hasHighlightCheckboxes
            />
          </fieldset>
        </div>
        <Button
          loadingText={t("common:actions.saving")}
          type="submit"
          loading={transition.state === "submitting"}
        >
          {t("common:actions.save")}
        </Button>
        <FormErrors namespace="user" />
      </Form>
    </Main>
  );
}
