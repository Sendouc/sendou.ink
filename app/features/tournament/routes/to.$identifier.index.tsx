import type { ActionFunction } from "@remix-run/node";
import { useFetcher, useOutletContext } from "@remix-run/react";
import * as React from "react";
import { Button } from "~/components/Button";
import { SubmitButton } from "~/components/SubmitButton";
import { useUser } from "~/modules/auth";
import type { SendouRouteHandle } from "~/utils/remix";
import { discordFullName } from "~/utils/strings";
import { CALENDAR_PAGE, LOG_IN_URL, navIconUrl } from "~/utils/urls";
import type { TournamentToolsLoaderData } from "./to.$identifier";

export const handle: SendouRouteHandle = {
  breadcrumb: () => ({
    imgPath: navIconUrl("calendar"),
    href: CALENDAR_PAGE,
    type: "IMAGE",
  }),
};

export const action: ActionFunction = () => {
  return null;
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
        <Register />
      ) : (
        <div>
          <FillRosterSection />
        </div>
      )}
    </div>
  );
}

function Register() {
  const user = useUser();
  const fetcher = useFetcher();

  if (!user) {
    return (
      <form className="stack items-center" action={LOG_IN_URL} method="post">
        <Button size="big" type="submit">
          Log in to register
        </Button>
      </form>
    );
  }

  return (
    <fetcher.Form className="stack items-center" method="post">
      <SubmitButton size="big" state={fetcher.state} _action="REGISTER">
        Register now
      </SubmitButton>
    </fetcher.Form>
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
