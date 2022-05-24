import { useCatch } from "@remix-run/react";
import { Button } from "~/components/Button";
import { useUser } from "~/hooks/useUser";
import { LOG_IN_URL, SENDOU_INK_DISCORD_URL } from "~/utils/urls";

export function Catcher() {
  const caught = useCatch();
  const user = useUser();

  switch (caught.status) {
    case 401:
      return (
        <div className="four-zero-one__container">
          <h2 className="four-zero-one__status-header">401 Unauthorized</h2>
          {user ? (
            <p>
              If you need assistance you can ask for help on{" "}
              <a className="four-zero-one__link" href={SENDOU_INK_DISCORD_URL}>
                our Discord
              </a>
            </p>
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
        </div>
      );
  }
}
