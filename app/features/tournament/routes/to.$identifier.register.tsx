import type { ActionFunction, LoaderArgs } from "@remix-run/node";
import { useFetcher, useOutletContext } from "@remix-run/react";
import { Button } from "~/components/Button";
import { SubmitButton } from "~/components/SubmitButton";
import { getUser, requireUser, useUser } from "~/modules/auth";
import { parseRequestFormData, type SendouRouteHandle } from "~/utils/remix";
import { discordFullName } from "~/utils/strings";
import { assertUnreachable } from "~/utils/types";
import { CALENDAR_PAGE, LOG_IN_URL, navIconUrl } from "~/utils/urls";
import { createTeam } from "../queries/createTeam.server";
import { findOwnTeam } from "../queries/findOwnTeam.server";
import { registerSchema } from "../tournament-schemas.server";
import type { TournamentToolsLoaderData } from "./to.$identifier";

export const handle: SendouRouteHandle = {
  breadcrumb: () => ({
    imgPath: navIconUrl("calendar"),
    href: CALENDAR_PAGE,
    type: "IMAGE",
  }),
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  const data = await parseRequestFormData({ request, schema: registerSchema });

  switch (data._action) {
    case "CREATE_TEAM": {
      // xxx: make sure user is not in another team
      // xxx: make sure tournament has not started
      createTeam({ calendarEventId: 1, ownerId: user.id });
      break;
    }
    case "placeholder": {
      break;
    }
    default: {
      assertUnreachable(data);
    }
  }

  return null;
};

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUser(request);

  if (!user) return null;

  return {
    ownTeam: findOwnTeam({ calendarEventId: 1, userId: user.id }),
  };
};

export default function TournamentRegisterPage() {
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
      {true ? (
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
      <SubmitButton size="big" state={fetcher.state} _action="CREATE_TEAM">
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
