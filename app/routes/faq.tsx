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
    <Main className="stack md">
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

      <details className="faq__details">
        <summary className="faq__summary">
          How to get a badge prize for my event?
        </summary>
        <p>
          You commission borzoic#1991 to make the badge. Price is 10-30€
          depending on the complexity. Afterwards contact Sendou to get it added
          to the web page.
        </p>
        <p>
          Any tournament can have a badge as a prize. If you want to award
          badges for other feats it&apos;s best to consult Sendou first about
          your idea.
        </p>
      </details>

      <details className="faq__details">
        <summary className="faq__summary">
          How to update my avatar or username?
        </summary>
        <p>
          Updating username or avatar on Discord doesn&apos;t right away update
          them on sendou.ink. To make that happen you have two options:
        </p>
        <ol>
          <li>
            If you are a member of this website&apos;s Discord or the Plus
            Server you can simply wait. There is a routine that runs once a day
            that handles the updating.
          </li>
          <li>
            Alternatively if you want to update them right away you can log out
            and back in on sendou.ink.
          </li>
        </ol>
      </details>
    </Main>
  );
}
