import { useCatch, useLocation } from "remix";
import { DISCORD_URL } from "~/constants";
import { getLogInUrl } from "~/utils";
import { useUser } from "~/hooks/common";
import { Button } from "./Button";

// TODO: some nice art
export function Catcher() {
  const caught = useCatch();
  const user = useUser();
  const location = useLocation();

  switch (caught.status) {
    case 401:
      return (
        <div className="four-zero-one__container">
          <h2 className="four-zero-one__status-header">401 Unauthorized</h2>
          {user ? (
            <p>
              If you need assistance you can ask for help on{" "}
              <a className="four-zero-one__link" href={DISCORD_URL}>
                our Discord
              </a>
            </p>
          ) : (
            <form action={getLogInUrl(location)} method="post">
              <p className="button-text-paragraph">
                You should try{" "}
                <Button type="submit" variant="minimal">
                  logging in
                </Button>
              </p>
            </form>
          )}
        </div>
      );
    // case 404:
    //   message = (
    //     <p>Oops! Looks like you tried to visit a page that does not exist.</p>
    //   );
    //   break;

    default:
      console.error(caught);
      throw new Error(`${caught.status} - ${caught.statusText},${caught.data}`);
  }
}
