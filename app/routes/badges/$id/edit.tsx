import * as React from "react";
import { useMatches, useOutletContext } from "@remix-run/react";
import { Button, LinkButton } from "~/components/Button";
import { Dialog } from "~/components/Dialog";
import { atOrError } from "~/utils/arrays";
import type { BadgeDetailsContext, BadgeDetailsLoaderData } from "../$id";
import { discordFullName } from "~/utils/strings";
import { UserCombobox } from "~/components/Combobox";
import { TrashIcon } from "~/components/icons/Trash";

// xxx: on SSR modal flickers first shown at top
export default function EditBadgePage() {
  const matches = useMatches();
  const data = atOrError(matches, -2).data as BadgeDetailsLoaderData;
  const { badgeName } = useOutletContext<BadgeDetailsContext>();

  return (
    <Dialog isOpen className="stack md">
      <div>
        <h2 className="badges-edit__big-header">
          Editing winners of {badgeName}
        </h2>
        <LinkButton
          to={atOrError(matches, -2).pathname}
          variant="minimal-destructive"
          tiny
        >
          Cancel
        </LinkButton>
      </div>

      <Managers data={data} />
      <Owners data={data} />
    </Dialog>
  );
}

function Managers({ data }: { data: BadgeDetailsLoaderData }) {
  const [managers, setManagers] = React.useState(
    data.managers.map((m) => ({
      id: m.id,
      discordFullName: discordFullName(m),
    }))
  );

  const amountOfChanges = managers
    .filter((m) => !data.managers.some((om) => om.id === m.id))
    // maps to id to keep typescript happy
    .map((m) => m.id)
    // needed so we can also list amount of removed managers
    .concat(
      data.managers
        .filter((om) => !managers.some((m) => m.id === om.id))
        .map((m) => m.id)
    ).length;

  return (
    <div className="stack md">
      <div className="stack sm">
        <h3 className="badges-edit__small-header">Managers</h3>
        <ul className="badges-edit__users-list">
          {managers.map((manager) => (
            <li key={manager.id}>
              {manager.discordFullName}
              <Button
                icon={<TrashIcon />}
                variant="minimal-destructive"
                aria-label="Delete badge manager"
                onClick={() =>
                  setManagers(managers.filter((m) => m.id !== manager.id))
                }
              />
            </li>
          ))}
        </ul>
        <UserCombobox
          className="mx-auto"
          inputName="new-manager"
          onChange={(user) => {
            if (!user) return;

            setManagers([
              ...managers,
              { discordFullName: user.label, id: Number(user.value) },
            ]);
          }}
          userIdsToOmit={new Set(managers.map((m) => m.id))}
        />
      </div>
      <Button
        type="submit"
        tiny
        className="w-full"
        disabled={amountOfChanges === 0}
      >
        {amountOfChanges > 0 ? `Submit ${amountOfChanges} changes` : "Submit"}
      </Button>
    </div>
  );
}

function Owners({ data }: { data: BadgeDetailsLoaderData }) {
  return (
    <div>
      <h3 className="badges-edit__small-header">Owners</h3>
      <div className="stack vertical md">
        <Button type="submit" tiny>
          Submit
        </Button>
      </div>
    </div>
  );
}
