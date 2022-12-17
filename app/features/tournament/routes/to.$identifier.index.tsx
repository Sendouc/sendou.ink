import { useOutletContext } from "@remix-run/react";
import * as React from "react";
import { Button } from "~/components/Button";
import type { SendouRouteHandle } from "~/utils/remix";
import { discordFullName } from "~/utils/strings";
import { CALENDAR_PAGE, navIconUrl } from "~/utils/urls";
import type { TournamentToolsLoaderData } from "./to.$identifier";

export const handle: SendouRouteHandle = {
  breadcrumb: () => ({
    imgPath: navIconUrl("calendar"),
    href: CALENDAR_PAGE,
    type: "IMAGE",
  }),
};

export default function TournamentFrontPage() {
  return <Prestart />;
}

export function Prestart() {
  // xxx: fix condition
  const [expanded, setExpanded] = React.useState(false);
  const data = useOutletContext<TournamentToolsLoaderData>();

  return (
    <div className="stack lg">
      <div className="tournament__logo-container">
        {/* xxx: dynamic image */}
        <img
          src="https://abload.de/img/screenshot2022-12-15ap0ca1.png"
          alt=""
          className="tournament__logo"
          width={124}
          height={124}
        />
        <div>
          <div className="tournament__title">{data.event.name}</div>
          <div className="tournament__by">
            by {discordFullName(data.event.author)}
          </div>
        </div>
      </div>
      <div>{data.event.description}</div>
      {!expanded ? (
        <div className="stack items-center">
          <Button big onClick={() => setExpanded(true)}>
            Register now
          </Button>
        </div>
      ) : (
        <div>
          <FillRosterSection />
        </div>
      )}
    </div>
  );
}

function FillRosterSection() {
  return (
    <div>
      <h3 className="tournament__section-header">1. Fill roster</h3>
      <section className="tournament__section">
        Share your invite link to add members https://sendou.ink/inv/${}
      </section>
    </div>
  );
}
