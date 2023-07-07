import type { LoaderArgs } from "@remix-run/node";
import { FormMessage } from "~/components/FormMessage";
import { Label } from "~/components/Label";
import { Main } from "~/components/Main";
import { requireUser } from "~/modules/auth";
import { validate } from "~/utils/remix";
import { ART } from "../art-constants";
import * as React from "react";
import { Toggle } from "~/components/Toggle";
import { SubmitButton } from "~/components/SubmitButton";
import { useTranslation } from "~/hooks/useTranslation";
import { UserCombobox } from "~/components/Combobox";
import { Button } from "~/components/Button";
import { CrossIcon } from "~/components/icons/Cross";
import { nanoid } from "nanoid";
import clone from "just-clone";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request);

  validate(user.isArtist, "No artist role", 401);

  return null;
};

// xxx: image

export default function NewArtPage() {
  const { t } = useTranslation(["common"]);

  const isValidated = true;

  return (
    <Main className="stack md" halfWidth>
      <FormMessage type="info">
        Few things to note: 1) Only upload Splatoon art 2) Only upload art you
        made yourself 3) No NSFW art. There is a validation process before art
        is shown to other users.
      </FormMessage>
      <Description />
      <LinkedUsers />
      {isValidated ? <ShowcaseToggle /> : null}
      <div>
        <SubmitButton>{t("common:actions.save")}</SubmitButton>
      </div>
    </Main>
  );
}

function Description() {
  const [value, setValue] = React.useState("");

  return (
    <div>
      <Label
        htmlFor="description"
        valueLimits={{ current: value.length, max: ART.DESCRIPTION_MAX_LENGTH }}
      >
        Description
      </Label>
      <textarea
        id="description"
        name="description"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={ART.DESCRIPTION_MAX_LENGTH}
      />
    </div>
  );
}

function LinkedUsers() {
  const [users, setUsers] = React.useState<
    { inputId: string; userId?: number }[]
  >([{ inputId: nanoid() }]);

  return (
    <div>
      <label htmlFor="user">Linked users</label>
      <input
        type="hidden"
        name="linkedUsers"
        value={JSON.stringify(
          users.filter((u) => u.userId).map((u) => u.userId)
        )}
      />
      {users.map(({ inputId }, i) => {
        return (
          <div key={inputId} className="stack horizontal sm mb-2 items-center">
            <UserCombobox
              inputName="user"
              onChange={(event) => {
                if (!event) return;
                const newUsers = clone(users);
                newUsers[i] = { ...newUsers[i], userId: Number(event.value) };

                setUsers(newUsers);
              }}
            />
            {users.length > 1 || users[0].userId ? (
              <Button
                size="tiny"
                variant="minimal-destructive"
                onClick={() => {
                  if (users.length === 1) {
                    setUsers([{ inputId: nanoid() }]);
                  } else {
                    setUsers(users.filter((u) => u.inputId !== inputId));
                  }
                }}
                icon={<CrossIcon />}
              />
            ) : null}
          </div>
        );
      })}
      <Button
        size="tiny"
        onClick={() => setUsers([...users, { inputId: nanoid() }])}
        disabled={users.length >= ART.LINKED_USERS_MAX_LENGTH}
        className="my-3"
      >
        Another one
      </Button>
      <FormMessage type="info">
        Who is in the art? Linking users allows your art to show up on their
        profile.
      </FormMessage>
    </div>
  );
}

function ShowcaseToggle() {
  const [checked, setChecked] = React.useState(false);

  return (
    <div>
      <label htmlFor="isShowcase">Showcase</label>
      <Toggle checked={checked} setChecked={setChecked} name="isShowcase" />
      <FormMessage type="info">
        Your showcase piece is shown on the common /art page. Only one piece can
        be your showcase at a time.
      </FormMessage>
    </div>
  );
}
