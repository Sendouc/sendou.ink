import { useMatches } from "@remix-run/react";
import invariant from "tiny-invariant";
import { LinkButton } from "~/components/Button";
import { Section } from "~/components/Section";
import { useTranslation } from "~/hooks/useTranslation";
import { useUser } from "~/modules/auth";
import { userResultsEditHighlightsPage } from "~/utils/urls";
import type { UserPageLoaderData } from "../../../features/user-page/routes/u.$identifier";
import { UserResultsTable } from "~/features/user-page/components/UserResultsTable";

export default function UserResultsPage() {
  const { t } = useTranslation("user");
  const [, parentRoute] = useMatches();
  invariant(parentRoute);

  const userPageData = parentRoute.data as UserPageLoaderData;
  const hasResults = userPageData.results.length > 0;

  const nonHighlights = userPageData.results.filter((r) => !r.isHighlight);
  const hasNonHighlights = nonHighlights.length > 0;

  const highlights = userPageData.results.filter((r) => r.isHighlight);
  const hasHighlights = highlights.length > 0;

  const user = useUser();
  const isOwnResultsPage = user?.id === userPageData.id;

  const showHighlightsSection =
    hasHighlights ||
    (isOwnResultsPage && hasResults && userPageData.results.length !== 1);

  return (
    <div className="stack lg">
      {showHighlightsSection && (
        <Section
          title={t("results.highlights")}
          className="u__results-table-wrapper u__results-table-highlights stack md"
        >
          {hasHighlights && (
            <UserResultsTable
              id="user-results-highlight-table"
              results={highlights}
            />
          )}
          {isOwnResultsPage && (
            <LinkButton
              variant="outlined"
              size="tiny"
              to={userResultsEditHighlightsPage(userPageData)}
              className="mx-auto"
            >
              {t("results.highlights.choose")}
            </LinkButton>
          )}
        </Section>
      )}
      {hasNonHighlights && (
        <Section
          title={
            hasHighlights ? t("results.nonHighlights") : t("results.title")
          }
          className="u__results-table-wrapper"
        >
          <UserResultsTable id="user-results-table" results={nonHighlights} />
        </Section>
      )}
    </div>
  );
}
