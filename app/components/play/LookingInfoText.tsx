import { Form, useLoaderData } from "remix";
import { LookingLoaderData } from "~/routes/play/looking";
import * as React from "react";
import { groupExpiredDates } from "~/core/play/utils";
import clsx from "clsx";
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

  const groupExpirationStatus = (():
    | undefined
    | "ALMOST_EXPIRED"
    | "EXPIRED" => {
    const { EXPIRED: expiredDate, ALMOST_EXPIRED: almostExpiredDate } =
      groupExpiredDates();
    if (expiredDate.getTime() > data.lastActionAtTimestamp) return "EXPIRED";
    if (almostExpiredDate.getTime() > data.lastActionAtTimestamp)
      return "EXPIRED";
  })();

  if (groupExpirationStatus) {
    const text =
      groupExpirationStatus === "EXPIRED"
        ? "Your group has been hidden due to inactivity"
        : `Without any activity your group will be hidden at ${groupExpiredDates()[
            "EXPIRED"
          ].toLocaleTimeString("en", { hour: "numeric", minute: "numeric" })}`;
    return (
      <Form method="post">
        <div
          className={clsx(CONTAINER_CLASSNAME, {
            expired: groupExpirationStatus === "EXPIRED",
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
