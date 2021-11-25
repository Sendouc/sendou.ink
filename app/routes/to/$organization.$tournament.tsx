// TODO: 404 page that shows other tournaments by the organization

import type { MetaFunction, LoaderFunction } from "remix";
import { useLoaderData, json, Link } from "remix";
import invariant from "tiny-invariant";
import { makeTitle } from "~/utils";
import {
  findTournamentByNameForUrl,
  FindTournamentByNameForUrlI,
} from "../../../services/tournament";

export const loader: LoaderFunction = ({ params }) => {
  invariant(
    typeof params.organization === "string",
    "Expected params.organization to be string"
  );
  invariant(
    typeof params.tournament === "string",
    "Expected params.tournament to be string"
  );

  return findTournamentByNameForUrl({
    organizationNameForUrl: params.organization,
    tournamentNameForUrl: params.tournament,
  });
};

export const meta: MetaFunction = (props) => {
  const data = props.data as FindTournamentByNameForUrlI;

  return {
    title: makeTitle(data.name),
    //description: data.description ?? undefined,
  };
};

// https://remix.run/guides/routing#index-routes
export default function Index() {
  const data = useLoaderData<FindTournamentByNameForUrlI>();

  return <div className="remix__page">hello</div>;
}
