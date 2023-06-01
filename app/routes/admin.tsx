import type {
  ActionFunction,
  LoaderFunction,
  V2_MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigation } from "@remix-run/react";
import * as React from "react";
import { z } from "zod";
import { Button } from "~/components/Button";
import { Catcher } from "~/components/Catcher";
import { UserCombobox } from "~/components/Combobox";
import { Main } from "~/components/Main";
import { SubmitButton } from "~/components/SubmitButton";
import { db } from "~/db";
import {
  getUserId,
  isImpersonating,
  requireUserId,
} from "~/modules/auth/user.server";
import { canPerformAdminActions } from "~/permissions";
import { dateToDatabaseTimestamp } from "~/utils/dates";
import {
  parseRequestFormData,
  validate,
  type SendouRouteHandle,
} from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import { assertUnreachable } from "~/utils/types";
import { impersonateUrl, SEED_URL, STOP_IMPERSONATING_URL } from "~/utils/urls";
import { actualNumber } from "~/utils/zod";

export const meta: V2_MetaFunction = () => {
  return [{ title: makeTitle("Admin page") }];
};

const adminActionSchema = z.union([
  z.object({
    _action: z.literal("MIGRATE"),
    "old-user[value]": z.preprocess(actualNumber, z.number().positive()),
    "new-user[value]": z.preprocess(actualNumber, z.number().positive()),
  }),
  z.object({
    _action: z.literal("REFRESH"),
  }),
  z.object({
    _action: z.literal("FORCE_PATRON"),
    "user[value]": z.preprocess(actualNumber, z.number().positive()),
    patronTier: z.preprocess(actualNumber, z.number()),
    patronTill: z.string(),
  }),
  z.object({
    _action: z.literal("VIDEO_ADDER"),
    "user[value]": z.preprocess(actualNumber, z.number().positive()),
  }),
  z.object({
    _action: z.literal("LINK_PLAYER"),
    "user[value]": z.preprocess(actualNumber, z.number().positive()),
    playerId: z.preprocess(actualNumber, z.number().positive()),
  }),
]);

export const action: ActionFunction = async ({ request }) => {
  const data = await parseRequestFormData({
    request,
    schema: adminActionSchema,
  });
  const user = await requireUserId(request);

  validate(canPerformAdminActions(user));

  switch (data._action) {
    case "MIGRATE": {
      db.users.migrate({
        oldUserId: data["old-user[value]"],
        newUserId: data["new-user[value]"],
      });
      break;
    }
    case "REFRESH": {
      db.users.refreshPlusTiers();
      break;
    }
    case "FORCE_PATRON": {
      db.users.forcePatron({
        id: data["user[value]"],
        patronSince: dateToDatabaseTimestamp(new Date()),
        patronTier: data.patronTier,
        patronTill: dateToDatabaseTimestamp(new Date(data.patronTill)),
      });
      break;
    }
    case "VIDEO_ADDER": {
      db.users.makeVideoAdder(data["user[value]"]);
      break;
    }
    case "LINK_PLAYER": {
      db.users.linkPlayer({
        userId: data["user[value]"],
        playerId: data.playerId,
      });

      break;
    }
    default: {
      assertUnreachable(data);
    }
  }

  return null;
};

interface AdminPageLoaderData {
  isImpersonating: boolean;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUserId(request);

  if (!canPerformAdminActions(user)) {
    return redirect("/");
  }

  return json<AdminPageLoaderData>({
    isImpersonating: await isImpersonating(request),
  });
};

export const handle: SendouRouteHandle = {
  navItemName: "admin",
};

export default function AdminPage() {
  return (
    <Main className="stack lg">
      <Impersonate />
      <LinkPlayer />
      <GiveVideoAdder />
      <MigrateUser />
      <ForcePatron />
      <RefreshPlusTiers />
      {process.env.NODE_ENV !== "production" && <Seed />}
    </Main>
  );
}

function Impersonate() {
  const fetcher = useFetcher();
  const [userId, setUserId] = React.useState<number>();
  const { isImpersonating } = useLoaderData<AdminPageLoaderData>();

  return (
    <fetcher.Form
      method="post"
      action={impersonateUrl(userId ?? 0)}
      className="stack md"
      reloadDocument
    >
      <h2>Impersonate user</h2>
      <div>
        <label>User to log in as</label>
        <UserCombobox
          inputName="user"
          onChange={(selected) =>
            setUserId(selected?.value ? Number(selected.value) : undefined)
          }
        />
      </div>
      <div className="stack horizontal md">
        <Button type="submit" disabled={!userId}>
          Go
        </Button>
        {isImpersonating ? (
          <Button type="submit" formAction={STOP_IMPERSONATING_URL}>
            Stop impersonating
          </Button>
        ) : null}
      </div>
    </fetcher.Form>
  );
}

function MigrateUser() {
  const [oldUserId, setOldUserId] = React.useState<number>();
  const [newUserId, setNewUserId] = React.useState<number>();
  const navigation = useNavigation();
  const fetcher = useFetcher();

  const submitButtonText =
    navigation.state === "submitting"
      ? "Migrating..."
      : navigation.state === "loading"
      ? "Migrated!"
      : "Migrate";

  return (
    <fetcher.Form className="stack md" method="post">
      <h2>Migrate user data</h2>
      <div className="stack horizontal md">
        <div>
          <label>Old user</label>
          <UserCombobox
            inputName="old-user"
            onChange={(selected) =>
              setOldUserId(selected?.value ? Number(selected.value) : undefined)
            }
          />
        </div>
        <div>
          <label>New user</label>
          <UserCombobox
            inputName="new-user"
            onChange={(selected) =>
              setNewUserId(selected?.value ? Number(selected.value) : undefined)
            }
          />
        </div>
      </div>
      <div className="stack horizontal md">
        <SubmitButton
          type="submit"
          disabled={!oldUserId || !newUserId || navigation.state !== "idle"}
          _action="MIGRATE"
          state={fetcher.state}
        >
          {submitButtonText}
        </SubmitButton>
      </div>
    </fetcher.Form>
  );
}

function LinkPlayer() {
  const fetcher = useFetcher();

  return (
    <fetcher.Form className="stack md" method="post">
      <h2>Link player</h2>
      <div className="stack horizontal md">
        <div>
          <label>User</label>
          <UserCombobox inputName="user" />
        </div>
        <div>
          <label>Player ID</label>
          <input type="number" name="playerId" />
        </div>
      </div>
      <div className="stack horizontal md">
        <SubmitButton type="submit" _action="LINK_PLAYER" state={fetcher.state}>
          Link player
        </SubmitButton>
      </div>
    </fetcher.Form>
  );
}

function GiveVideoAdder() {
  const fetcher = useFetcher();

  return (
    <fetcher.Form className="stack md" method="post">
      <h2>Give video adder</h2>
      <div className="stack horizontal md">
        <div>
          <label>User</label>
          <UserCombobox inputName="user" />
        </div>
      </div>
      <div className="stack horizontal md">
        <SubmitButton type="submit" _action="VIDEO_ADDER" state={fetcher.state}>
          Add as video adder
        </SubmitButton>
      </div>
    </fetcher.Form>
  );
}

function ForcePatron() {
  const fetcher = useFetcher();

  return (
    <fetcher.Form className="stack md" method="post">
      <h2>Force patron</h2>
      <div className="stack horizontal md">
        <div>
          <label>User</label>
          <UserCombobox inputName="user" />
        </div>

        <div>
          <label>Tier</label>
          <select name="patronTier">
            <option value="1">Support</option>
            <option value="2">Supporter</option>
            <option value="3">Supporter+</option>
          </select>
        </div>

        <div>
          <label>Patron till</label>
          <input name="patronTill" type="date" />
        </div>
      </div>
      <div className="stack horizontal md">
        <SubmitButton
          type="submit"
          _action="FORCE_PATRON"
          state={fetcher.state}
        >
          Save
        </SubmitButton>
      </div>
    </fetcher.Form>
  );
}

function RefreshPlusTiers() {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="post">
      <h2>Refresh Plus Tiers</h2>
      <SubmitButton type="submit" _action="REFRESH" state={fetcher.state}>
        Refresh
      </SubmitButton>
    </fetcher.Form>
  );
}

function Seed() {
  const fetcher = useFetcher();

  return (
    <fetcher.Form
      className="stack md items-start"
      method="post"
      action={SEED_URL}
    >
      <h2>Seed</h2>
      <Button type="submit">Seed</Button>
    </fetcher.Form>
  );
}

export const CatchBoundary = Catcher;
