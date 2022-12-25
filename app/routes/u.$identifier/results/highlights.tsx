import { type ActionFunction, redirect } from "@remix-run/node";
import { Form, useMatches } from "@remix-run/react";
import { useTranslation } from "~/hooks/useTranslation";
import invariant from "tiny-invariant";
import { z } from "zod";
import { FormErrors } from "~/components/FormErrors";
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
import { SubmitButton } from "~/components/SubmitButton";

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

  invariant(parentRoute);
  const userPageData = parentRoute.data as UserPageLoaderData;

  return (
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
      <SubmitButton>{t("common:actions.save")}</SubmitButton>
      <FormErrors namespace="user" />
    </Form>
  );
}
