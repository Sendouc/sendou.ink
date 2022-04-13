import { Form, useLoaderData } from "remix";
import { LookingLoaderData } from "~/routes/play/looking";
import { Button } from "../Button";
import { Chat } from "../Chat";
import { GroupCard } from "./GroupCard";

export function FinishedGroup() {
  const data = useLoaderData<LookingLoaderData>();

  return (
    <div>
      {data.ownGroup.members && (
        <Chat
          id={data.ownGroup.id}
          users={Object.fromEntries(
            data.ownGroup.members.map((m) => [
              m.id,
              { name: m.discordName, info: m.friendCode },
            ])
          )}
        />
      )}
      <div className="play-looking__waves">
        <GroupCard group={data.ownGroup} showAction={false} />
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
