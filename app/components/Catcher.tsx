import { useCatch } from "@remix-run/react";
import { Button } from "~/components/Button";
import { useUser } from "~/modules/auth";
import { LOG_IN_URL, SENDOU_INK_DISCORD_URL } from "~/utils/urls";
import { Main } from "./Main";

export function Catcher() {
  const caught = useCatch();
  const user = useUser();

  switch (caught.status) {
    case 401:
      return (
        <Main>
          <h2>Error 401 Unauthorized</h2>
          {user ? (
            <GetHelp />
          ) : (
            <form action={LOG_IN_URL} method="post">
              <p className="button-text-paragraph">
                You should try{" "}
                <Button type="submit" variant="minimal">
                  logging in
                </Button>
              </p>
            </form>
          )}
        </Main>
      );
    case 404:
      return (
        <Main>
          <h2>Error {caught.status} - Page not found</h2>
          <GetHelp />
        </Main>
      );
    default:
      return (
        <Main>
          <h2>Error {caught.status}</h2>
          {caught.data ? (
            <code>{JSON.stringify(caught.data, null, 2)}</code>
          ) : null}
          <GetHelp />
        </Main>
      );
  }
}

function GetHelp() {
  return (
    <p className="mt-2">
      If you need assistance you can ask for help on{" "}
      <a href={SENDOU_INK_DISCORD_URL}>our Discord</a>
    </p>
  );
}
