import type { LinksFunction, MetaFunction } from "remix";
import styles from "~/styles/play.css";
import { makeTitle } from "~/utils";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = () => {
  return {
    title: makeTitle("Play!"),
  };
};

export default function PlayPage() {
  return <div className="container">hi</div>;
}
