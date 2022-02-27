import { DISCORD_URL } from "~/constants";

export default function BetaPage() {
  return (
    <div className="container">
      <h2>Beta of sendou.ink (Splatoon 3)</h2>
      <p>
        Hello there! I appreciate you taking time to visit this beta version of
        sendou.ink&apos;s Splatoon 3 site. This being a beta there is a few
        things you should consider:
      </p>
      <ul className="mt-2">
        <li>
          It&apos;s likely the database will be cleared (more than once) before
          beta ends
        </li>
        <li>
          Bugs are expected. Please give feedback on{" "}
          <a href={DISCORD_URL}>our Discord</a>
        </li>
        <li>
          Follow <a href="https://twitter.com/sendouink">Twitter</a> for
          announcements about test tournaments and everything else related to
          sendou.ink
        </li>
      </ul>
      <p className="mt-4">
        <a href="https://sendou.ink">Return to Splatoon 2 sendou.ink</a>
      </p>
    </div>
  );
}
