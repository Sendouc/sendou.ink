import type {
  ActionFunction,
  LoaderArgs,
  SerializeFrom,
} from "@remix-run/node";
import { useFetcher, useLoaderData, useOutletContext } from "@remix-run/react";
import { useTranslation } from "~/hooks/useTranslation";
import { useCopyToClipboard } from "react-use";
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
import { idFromParams } from "../tournament-utils";
import type { TournamentToolsLoaderData } from "./to.$id";

export const handle: SendouRouteHandle = {
  breadcrumb: () => ({
    imgPath: navIconUrl("calendar"),
    href: CALENDAR_PAGE,
    type: "IMAGE",
  }),
};

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUser(request);
  const data = await parseRequestFormData({ request, schema: registerSchema });

  switch (data._action) {
    case "CREATE_TEAM": {
      // xxx: make sure user is not in another team
      // xxx: make sure tournament has not started
      createTeam({ calendarEventId: idFromParams(params), ownerId: user.id });
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

export const loader = async ({ request, params }: LoaderArgs) => {
  const user = await getUser(request);

  if (!user) return null;

  const ownTeam = findOwnTeam({
    calendarEventId: idFromParams(params),
    userId: user.id,
  });
  if (!ownTeam) return null;

  return {
    ownTeam,
  };
};

export default function TournamentRegisterPage() {
  const data = useLoaderData<typeof loader>();
  const parentRouteData = useOutletContext<TournamentToolsLoaderData>();

  console.log({ data });

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
          <div className="tournament__title">{parentRouteData.event.name}</div>
          <div className="tournament__by">
            by {discordFullName(parentRouteData.event.author)}
          </div>
        </div>
      </div>
      <div>{parentRouteData.event.description}</div>
      {!data?.ownTeam ? (
        <Register />
      ) : (
        <div>
          <EditTeam ownTeam={data.ownTeam} />
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

function EditTeam({
  ownTeam,
}: {
  ownTeam: NonNullable<SerializeFrom<typeof loader>>["ownTeam"];
}) {
  const [, copyToClipboard] = useCopyToClipboard();
  const { t } = useTranslation(["common"]);

  const inviteLink = `https://sendou.ink/inv/${ownTeam.inviteCode}`;

  return (
    <div>
      <h3 className="tournament__section-header">1. Fill roster</h3>
      <section className="tournament__section stack md items-center">
        <div className="text-center text-sm">
          Share your invite link to add members {inviteLink}
        </div>
        <div>
          <Button size="tiny" onClick={() => copyToClipboard(inviteLink)}>
            {t("common:actions.copyToClipboard")}
          </Button>
        </div>
      </section>
    </div>
  );
}
