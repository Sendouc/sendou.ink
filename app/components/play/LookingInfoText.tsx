import clsx from "clsx";
import * as React from "react";
import { Form, useLoaderData } from "remix";
import {
  groupExpirationStatus,
  groupWillBeInactiveAt,
} from "~/core/play/utils";
import { LookingLoaderData } from "~/routes/play/looking";
import { Button } from "../Button";

const CONTAINER_CLASSNAME = "play-looking__info-text";

export function LookingInfoText({ lastUpdated }: { lastUpdated: Date }) {
  const [, forceUpdate] = React.useState(Math.random());
  const data = useLoaderData<LookingLoaderData>();

  React.useEffect(() => {
    const timer = setInterval(() => {
      forceUpdate(Math.random());
    }, 10000); // 10 seconds

    return () => clearInterval(timer);
  }, []);

  if (groupExpirationStatus(data.lastActionAtTimestamp)) {
    const text =
      groupExpirationStatus(data.lastActionAtTimestamp) === "EXPIRED"
        ? "Your group has been hidden due to inactivity"
        : `Without any activity your group will be hidden at ${groupWillBeInactiveAt(
            data.lastActionAtTimestamp
          ).toLocaleTimeString("en", { hour: "numeric", minute: "numeric" })}`;
    return (
      <Form method="post">
        <div
          className={clsx(CONTAINER_CLASSNAME, {
            expired:
              groupExpirationStatus(data.lastActionAtTimestamp) === "EXPIRED",
          })}
        >
          {text}. Click{" "}
          <Button
            className="play-looking__info-button"
            variant="minimal"
            name="_action"
            value="UNEXPIRE"
          >
            here
          </Button>{" "}
          if you are still looking.
        </div>
      </Form>
    );
  }

  return (
    <div className={CONTAINER_CLASSNAME}>
      Last updated:{" "}
      {lastUpdated.toLocaleTimeString("en", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      })}
    </div>
  );
}
