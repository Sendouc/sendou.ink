import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import * as React from "react";
import { z } from "zod";
import { Button } from "~/components/Button";
import { Catcher } from "~/components/Catcher";
import { Main } from "~/components/Main";
import { SubmitButton } from "~/components/SubmitButton";
import { UserSearch } from "~/components/UserSearch";
import { makeArtist } from "~/features/art";
import { useUser } from "~/features/auth/core/user";
import {
  getUserId,
  isImpersonating,
  requireUserId,
} from "~/features/auth/core/user.server";
import { isAdmin, isMod } from "~/permissions";
import {
  parseRequestFormData,
  validate,
  type SendouRouteHandle,
} from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import { assertUnreachable } from "~/utils/types";
import { impersonateUrl, SEED_URL, STOP_IMPERSONATING_URL } from "~/utils/urls";
import { _action, actualNumber } from "~/utils/zod";
import * as AdminRepository from "~/features/admin/AdminRepository.server";

export const meta: MetaFunction = () => {
  return [{ title: makeTitle("Admin page") }];
};

const adminActionSchema = z.union([
  z.object({
    _action: _action("MIGRATE"),
    "old-user": z.preprocess(actualNumber, z.number().positive()),
    "new-user": z.preprocess(actualNumber, z.number().positive()),
  }),
  z.object({
    _action: _action("REFRESH"),
  }),
  z.object({
    _action: _action("CLEAN_UP"),
  }),
  z.object({
    _action: _action("FORCE_PATRON"),
    user: z.preprocess(actualNumber, z.number().positive()),
    patronTier: z.preprocess(actualNumber, z.number()),
    patronTill: z.string(),
  }),
  z.object({
    _action: _action("VIDEO_ADDER"),
    user: z.preprocess(actualNumber, z.number().positive()),
  }),
  z.object({
    _action: _action("ARTIST"),
    user: z.preprocess(actualNumber, z.number().positive()),
  }),
  z.object({
    _action: _action("LINK_PLAYER"),
    user: z.preprocess(actualNumber, z.number().positive()),
    playerId: z.preprocess(actualNumber, z.number().positive()),
  }),
]);

export const action: ActionFunction = async ({ request }) => {
  const data = await parseRequestFormData({
    request,
    schema: adminActionSchema,
  });
  const user = await requireUserId(request);

  switch (data._action) {
    case "MIGRATE": {
      validate(isAdmin(user), "Admin needed", 401);

      await AdminRepository.migrate({
        oldUserId: data["old-user"],
        newUserId: data["new-user"],
      });
      break;
    }
    case "REFRESH": {
      validate(isAdmin(user));

      await AdminRepository.refreshPlusTiers();
      break;
    }
    case "FORCE_PATRON": {
      validate(isAdmin(user), "Admin needed", 401);

      await AdminRepository.forcePatron({
        id: data["user"],
        patronSince: new Date(),
        patronTier: data.patronTier,
        patronTill: new Date(data.patronTill),
      });
      break;
    }
    case "CLEAN_UP": {
      validate(isAdmin(user), "Admin needed", 401);

      // on purpose sync
      AdminRepository.cleanUp();
      break;
    }
    case "ARTIST": {
      validate(isMod(user), "Mod needed", 401);

      makeArtist(data["user"]);
      break;
    }
    case "VIDEO_ADDER": {
      validate(isMod(user), "Mod needed", 401);

      await AdminRepository.makeVideoAdderByUserId(data["user"]);
      break;
    }
    case "LINK_PLAYER": {
      validate(isMod(user), "Mod needed", 401);

      await AdminRepository.linkUserAndPlayer({
        userId: data["user"],
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

  if (process.env.NODE_ENV === "production" && !isMod(user)) {
    throw redirect("/");
  }

  return json<AdminPageLoaderData>({
    isImpersonating: await isImpersonating(request),
  });
};

export const handle: SendouRouteHandle = {
  navItemName: "admin",
};

export default function AdminPage() {
  const user = useUser();

  return (
    <Main className="stack lg">
      {isMod(user) ? <LinkPlayer /> : null}
      {isMod(user) ? <GiveArtist /> : null}
      {isMod(user) ? <GiveVideoAdder /> : null}

      {process.env.NODE_ENV !== "production" || isAdmin(user) ? (
        <Impersonate />
      ) : null}
      {isAdmin(user) ? <MigrateUser /> : null}
      {isAdmin(user) ? <ForcePatron /> : null}
      {isAdmin(user) ? <RefreshPlusTiers /> : null}
      {isAdmin(user) ? <CleanUp /> : null}

      {process.env.NODE_ENV !== "production" && <Seed />}
    </Main>
  );
}

function Impersonate() {
  const [userId, setUserId] = React.useState<number>();
  const { isImpersonating } = useLoaderData<AdminPageLoaderData>();

  return (
    <Form
      method="post"
      action={impersonateUrl(userId ?? 0)}
      className="stack md"
      reloadDocument
    >
      <h2>Impersonate user</h2>
      <div>
        <label>User to log in as</label>
        <UserSearch
          inputName="user"
          onChange={(newUser) => setUserId(newUser.id)}
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
    </Form>
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
          <UserSearch
            inputName="old-user"
            onChange={(newUser) => setOldUserId(newUser.id)}
          />
        </div>
        <div>
          <label>New user</label>
          <UserSearch
            inputName="new-user"
            onChange={(newUser) => setNewUserId(newUser.id)}
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
          <UserSearch inputName="user" />
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

function GiveArtist() {
  const fetcher = useFetcher();

  return (
    <fetcher.Form className="stack md" method="post">
      <h2>Add as artist</h2>
      <div className="stack horizontal md">
        <div>
          <label>User</label>
          <UserSearch inputName="user" />
        </div>
      </div>
      <div className="stack horizontal md">
        <SubmitButton type="submit" _action="ARTIST" state={fetcher.state}>
          Add as artist
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
          <UserSearch inputName="user" />
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
          <UserSearch inputName="user" />
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

function CleanUp() {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="post">
      <h2>DB Clean up</h2>
      <SubmitButton type="submit" _action="CLEAN_UP" state={fetcher.state}>
        Clean up
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

export const ErrorBoundary = Catcher;
