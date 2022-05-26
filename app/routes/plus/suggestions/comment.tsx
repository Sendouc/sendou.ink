import { useMatches, useNavigate, useSearchParams } from "@remix-run/react";
import { Dialog } from "~/components/Dialog";
import { Redirect } from "~/components/Redirect";
import { PLUS_SUGGESTIONS_PAGE } from "~/utils/urls";
import type { PlusSuggestionsLoaderData } from "../suggestions";

export default function PlusCommentModalPage() {
  const matches = useMatches();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const data = matches.at(-2)!.data as PlusSuggestionsLoaderData;

  const userBeingCommentedId = Number(searchParams.get("id"));
  const tierSuggestedTo = Number(searchParams.get("tier"));

  const userBeingCommented = data.suggestions
    ?.find(({ tier }) => tier === tierSuggestedTo)
    ?.users.find((u) => u.info.id === userBeingCommentedId);

  if (!userBeingCommented) {
    return <Redirect to={PLUS_SUGGESTIONS_PAGE} />;
  }

  return (
    <Dialog isOpen close={() => navigate(PLUS_SUGGESTIONS_PAGE)}>
      hello world
    </Dialog>
  );
}
