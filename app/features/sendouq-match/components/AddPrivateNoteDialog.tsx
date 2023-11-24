import { useFetcher } from "@remix-run/react";
import { Dialog } from "~/components/Dialog";
import * as React from "react";
import { Label } from "~/components/Label";
import { SENDOUQ } from "~/features/sendouq/q-constants";
import { SubmitButton } from "~/components/SubmitButton";
import { FormMessage } from "~/components/FormMessage";
import { preferenceEmojiUrl } from "~/utils/urls";
import { useTranslation } from "~/hooks/useTranslation";
import { Button } from "~/components/Button";
import { CrossIcon } from "~/components/icons/Cross";

// xxx: some feedback after submitting
export function AddPrivateNoteDialog({
  aboutUser,
  close,
}: {
  aboutUser?: { id: number; discordName: string };
  close: () => void;
}) {
  const { t } = useTranslation(["q", "common"]);
  const fetcher = useFetcher();

  if (!aboutUser) return null;

  return (
    <Dialog isOpen>
      <fetcher.Form method="post" className="stack md">
        <input type="hidden" name="targetId" value={aboutUser.id} />
        <div className="stack horizontal items-center justify-between">
          <h2 className="text-md">
            {t("q:privateNote.header", { name: aboutUser.discordName })}
          </h2>
          <Button
            variant="minimal-destructive"
            icon={<CrossIcon />}
            onClick={close}
          />
        </div>
        <Textarea />
        <Sentiment />
        <div className="stack items-center mt-2">
          <SubmitButton _action="ADD_PRIVATE_USER_NOTE">
            {t("common:actions.save")}
          </SubmitButton>
        </div>
      </fetcher.Form>
    </Dialog>
  );
}

function Sentiment() {
  const { t } = useTranslation(["q"]);
  const [sentiment, setSentiment] = React.useState<
    "POSITIVE" | "NEUTRAL" | "NEGATIVE"
  >("NEUTRAL");

  return (
    <div>
      <Label>{t("q:privateNote.sentiment.header")}</Label>
      <input type="hidden" name="sentiment" value={sentiment} />
      <div className="stack xs my-2">
        {(["POSITIVE", "NEUTRAL", "NEGATIVE"] as const).map(
          (sentimentRadio) => {
            return (
              <div
                key={sentimentRadio}
                className="stack horizontal xs items-center"
              >
                <input
                  type="radio"
                  id={sentimentRadio}
                  checked={sentimentRadio === sentiment}
                  onChange={() => setSentiment(sentimentRadio)}
                />
                <label
                  htmlFor={sentimentRadio}
                  className="mb-0 stack horizontal xs"
                >
                  <img
                    src={preferenceEmojiUrl(
                      sentimentRadio === "POSITIVE"
                        ? "PREFER"
                        : sentimentRadio === "NEGATIVE"
                        ? "AVOID"
                        : undefined,
                    )}
                    alt=""
                    width={18}
                  />
                  {t(`q:privateNote.sentiment.${sentimentRadio}`)}
                </label>
              </div>
            );
          },
        )}
      </div>
      <FormMessage type="info">{t("q:privateNote.sentiment.info")}</FormMessage>
    </div>
  );
}

function Textarea({ initialValue }: { initialValue?: string }) {
  const [value, setValue] = React.useState(initialValue ?? "");

  return (
    <div className="u-edit__bio-container">
      <Label
        htmlFor="text"
        valueLimits={{
          current: value.length,
          max: SENDOUQ.PRIVATE_USER_NOTE_MAX_LENGTH,
        }}
      >
        Text
      </Label>
      <textarea
        id="text"
        name="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={SENDOUQ.PRIVATE_USER_NOTE_MAX_LENGTH}
      />
    </div>
  );
}
