import type {
  LinksFunction,
  LoaderArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Main } from "~/components/Main";
import { notFoundIfFalsy } from "~/utils/remix";
import { PlacementsTable } from "../components/Placements";
import { findPlacementsByPlayerId } from "../queries/findPlacements.server";
import styles from "../placements.css";
import { removeDuplicates } from "~/utils/arrays";
import { userPage } from "~/utils/urls";
import { i18next } from "~/modules/i18n";
import { makeTitle } from "~/utils/strings";
import { useTranslation } from "~/hooks/useTranslation";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = (args) => {
  const data = args.data as SerializeFrom<typeof loader> | null;

  if (!data) return {};

  return {
    title: data.title,
    description: `Splatoon 3 X Battle for the player ${
      data.placements[0]!.name
    }`,
  };
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const placements = notFoundIfFalsy(
    findPlacementsByPlayerId(Number(params["id"]))
  );

  const t = await i18next.getFixedT(request);

  return {
    placements,
    title: makeTitle([placements[0]!.name, t("pages.xsearch")]),
  };
};

export default function XSearchPlayerPage() {
  const { t } = useTranslation(["common"]);
  const data = useLoaderData<typeof loader>();

  const firstName = data.placements[0]!.name;
  const aliases = removeDuplicates(
    data.placements
      .map((placement) => placement.name)
      .filter((name) => name !== firstName)
  );

  const hasUserLinked = Boolean(data.placements[0]!.discordId);

  return (
    <Main halfWidth className="stack lg">
      <div>
        <h2 className="text-lg">
          {hasUserLinked ? (
            <Link to={userPage(data.placements[0]!)}>{firstName}</Link>
          ) : (
            <>{firstName}</>
          )}{" "}
          {t("common:xsearch.placements")}
        </h2>
        {aliases.length > 0 ? (
          <div className="text-lighter text-sm">
            {t("common:xsearch.aliases")} {aliases.join(", ")}
          </div>
        ) : null}
      </div>
      <PlacementsTable placements={data.placements} type="MODE_INFO" />
    </Main>
  );
}
