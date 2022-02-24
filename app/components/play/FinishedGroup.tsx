import { Form, useLoaderData } from "remix";
import { DISCORD_URL } from "~/constants";
import { LookingLoaderData } from "~/routes/play/looking";
import { Button } from "../Button";
import { GroupCard } from "./GroupCard";

export function FinishedGroup() {
  const data = useLoaderData<LookingLoaderData>();

  return (
    <div className="container">
      <div className="play-looking__waves">
        <GroupCard group={data.ownGroup} showAction={false} />
        <div className="play-looking__waves-text">
          This is your group! You can reach out to them on{" "}
          <a href={DISCORD_URL}>our Discord</a> in the #group-meetup channel.
        </div>
      </div>
      <div className="play-looking__waves-button">
        <Form method="post">
          <Button
            type="submit"
            name="_action"
            value="LOOK_AGAIN"
            tiny
            variant="outlined"
          >
            Look again
          </Button>
        </Form>
      </div>
    </div>
  );
}
