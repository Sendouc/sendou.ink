import { json, redirect } from "@remix-run/node";
import type {
  LoaderFunction,
  MetaFunction,
  ActionFunction,
} from "@remix-run/node";
import {
  Form,
  useFetcher,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import * as React from "react";
import { Button } from "~/components/Button";
import { Catcher } from "~/components/Catcher";
import { UserCombobox } from "~/components/Combobox";
import { Main } from "~/components/Main";
import { requireUser } from "~/modules/auth";
import { getUser, isImpersonating } from "~/modules/auth/user.server";
import { canPerformAdminActions } from "~/permissions";
import { makeTitle, parseRequestFormData, validate } from "~/utils/remix";
import { impersonateUrl, STOP_IMPERSONATING_URL } from "~/utils/urls";
import { db } from "~/db";
import { z } from "zod";
import { actualNumber } from "~/utils/zod";

export const meta: MetaFunction = () => {
  return {
    title: makeTitle("Admin page"),
  };
};

const adminActionSchema = z.object({
  "old-user[value]": z.preprocess(actualNumber, z.number().positive()),
  "new-user[value]": z.preprocess(actualNumber, z.number().positive()),
});

export const action: ActionFunction = async ({ request }) => {
  const data = await parseRequestFormData({
    request,
    schema: adminActionSchema,
  });
  const user = await requireUser(request);

  validate(canPerformAdminActions(user));

  db.users.migrate({
    oldUserId: data["old-user[value]"],
    newUserId: data["new-user[value]"],
  });

  return null;
};

interface AdminPageLoaderData {
  isImpersonating: boolean;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);

  if (!canPerformAdminActions(user)) {
    return redirect("/");
  }

  return json<AdminPageLoaderData>({
    isImpersonating: await isImpersonating(request),
  });
};

export default function AdminPage() {
  return (
    <Main className="stack lg">
      <Impersonate />
      <MigrateUser />
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
      <div className="stack vertical md">
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
  const transition = useTransition();

  const submitButtonText =
    transition.state === "submitting"
      ? "Migrating..."
      : transition.state === "loading"
      ? "Migrated!"
      : "Migrate";

  return (
    <Form className="stack md" method="post">
      <h2>Migrate user data</h2>
      <div className="stack vertical md">
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
      <div className="stack vertical md">
        <Button
          type="submit"
          disabled={!oldUserId || !newUserId || transition.state !== "idle"}
        >
          {submitButtonText}
        </Button>
      </div>
    </Form>
  );
}

export const CatchBoundary = Catcher;
