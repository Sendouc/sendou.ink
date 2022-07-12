import type { MetaFunction } from "@remix-run/node";
import { Main } from "~/components/Main";
import { makeTitle } from "~/utils/remix";
import {
  BORZOIC_TWITTER,
  GITHUB_CONTRIBUTORS_URL,
  LEAN_TWITTER,
  SENDOU_TWITTER_URL,
  UBERU_TWITTER,
} from "~/utils/urls";

export const meta: MetaFunction = () => {
  return {
    title: makeTitle("Contributions"),
  };
};

export default function ContributionsPage() {
  return (
    <Main>
      <p>
        Sendou.ink is a project by{" "}
        <a href={SENDOU_TWITTER_URL} target="_blank" rel="noreferrer">
          Sendou
        </a>{" "}
        with help from contributors:
      </p>
      <ul className="mt-2">
        <li>
          <a href={GITHUB_CONTRIBUTORS_URL} target="_blank" rel="noreferrer">
            Several made commits to the code
          </a>
        </li>
        <li>
          <a href={LEAN_TWITTER} target="_blank" rel="noreferrer">
            Lean
          </a>{" "}
          - Helped with uncovering Splatoon internals and created the Lanista
          bot
        </li>
        <li>
          <a href={BORZOIC_TWITTER} target="_blank" rel="noreferrer">
            borzoic
          </a>{" "}
          - Made badges, icons and front page art
        </li>
        <li>
          <a href={UBERU_TWITTER} target="_blank" rel="noreferrer">
            uberu
          </a>{" "}
          - Drew mini Judd holding heart emoji
        </li>
      </ul>
    </Main>
  );
}
