import { json, redirect } from "@remix-run/node";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import * as React from "react";
import { Button } from "~/components/Button";
import { Catcher } from "~/components/Catcher";
import { UserCombobox } from "~/components/Combobox";
import { Main } from "~/components/Main";
import { requireUser } from "~/modules/auth";
import { isImpersonating } from "~/modules/auth/user.server";
import { canPerformAdminActions } from "~/permissions";
import { makeTitle } from "~/utils/remix";
import { impersonateUrl, STOP_IMPERSONATING_URL } from "~/utils/urls";

export const meta: MetaFunction = () => {
  return {
    title: makeTitle("Admin page"),
  };
};

interface AdminPageLoaderData {
  isImpersonating: boolean;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);

  if (!canPerformAdminActions(user)) {
    return redirect("/");
  }

  return json<AdminPageLoaderData>({
    isImpersonating: await isImpersonating(request),
  });
};

export default function AdminPage() {
  const { isImpersonating } = useLoaderData<AdminPageLoaderData>();
  const fetcher = useFetcher();
  const [userIdToLogInAs, setUserIdToLogInAs] = React.useState<number>();

  return (
    <Main>
      <fetcher.Form
        method="post"
        action={impersonateUrl(userIdToLogInAs ?? 0)}
        className="stack md"
        reloadDocument
      >
        <h2>Impersonate user</h2>
        <div>
          <label>User to log in as</label>
          <UserCombobox
            inputName="user"
            onChange={(selected) =>
              setUserIdToLogInAs(
                selected?.value ? Number(selected.value) : undefined
              )
            }
          />
        </div>
        <div className="stack vertical md">
          <Button type="submit" disabled={!userIdToLogInAs}>
            Go
          </Button>
          {isImpersonating ? (
            <Button type="submit" formAction={STOP_IMPERSONATING_URL}>
              Stop impersonating
            </Button>
          ) : null}
        </div>
      </fetcher.Form>
    </Main>
  );
}

export const CatchBoundary = Catcher;
