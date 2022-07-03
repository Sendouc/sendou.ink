import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { Main } from "~/components/Main";
import styles from "~/styles/faq.css";
import { makeTitle } from "~/utils/remix";

export const meta: MetaFunction = () => {
  return {
    title: makeTitle("FAQ"),
    description: "Frequently asked questions",
  };
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export default function FAQPage() {
  return (
    <Main>
      <details className="faq__details">
        <summary className="faq__summary">What is the Plus Server?</summary>
        <p>
          Plus Server is a Discord server for high level western players to look
          for people to play with and against. It was founded on September 2017.
          Divided into three tiers of which +1 is the highest. You get access
          when a member of the server suggests you and you pass the monthly
          voting.
        </p>
        <p>
          In the voting you get a percentage based on your result. 0% would mean
          everyone who participated in the voting downvoted you while 100% would
          be the opposite. 50% is required to pass the voting. If a member gets
          a score below 50% they get demoted a tier or in the case of +3 kicked.
        </p>
      </details>
    </Main>
  );
}
