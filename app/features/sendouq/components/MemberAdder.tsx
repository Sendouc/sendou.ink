import { useFetcher } from "@remix-run/react";
import { useCopyToClipboard } from "react-use";
import { Button } from "~/components/Button";
import { SubmitButton } from "~/components/SubmitButton";
import {
  SENDOUQ_PREPARING_PAGE,
  SENDOU_INK_BASE_URL,
  sendouQInviteLink,
} from "~/utils/urls";
import * as React from "react";
import { ClipboardIcon } from "~/components/icons/Clipboard";
import { PlusIcon } from "~/components/icons/Plus";
import { CheckmarkIcon } from "~/components/icons/Checkmark";
import { useTranslation } from "react-i18next";

export function MemberAdder({
  inviteCode,
  trustedPlayers,
}: {
  inviteCode: string;
  trustedPlayers: Array<{
    id: number;
    discordName: string;
  }>;
}) {
  const { t } = useTranslation(["q"]);
  const [trustedUser, setTrustedUser] = React.useState<number>();
  const fetcher = useFetcher();
  const inviteLink = `${SENDOU_INK_BASE_URL}${sendouQInviteLink(inviteCode)}`;
  const [state, copyToClipboard] = useCopyToClipboard();
  const [copySuccess, setCopySuccess] = React.useState(false);

  const trustedPlayerIdsJoined = trustedPlayers.map((p) => p.id).join(",");
  React.useEffect(() => {
    setTrustedUser(undefined);
  }, [trustedPlayerIdsJoined]);

  React.useEffect(() => {
    if (!state.value) return;

    setCopySuccess(true);
    const timeout = setTimeout(() => setCopySuccess(false), 2000);

    return () => clearTimeout(timeout);
  }, [state]);

  return (
    <div className="stack md flex-wrap justify-center">
      {trustedPlayers.length > 0 ? (
        <fetcher.Form method="post" action={SENDOUQ_PREPARING_PAGE}>
          <label htmlFor="players">
            {t("q:looking.groups.adder.quickAdd")}
          </label>
          <div className="stack horizontal sm items-center">
            <select
              name="id"
              id="players"
              onChange={(e) =>
                setTrustedUser(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              className="q__member-adder__input"
            >
              <option value="">{t("q:looking.groups.adder.selectUser")}</option>
              {trustedPlayers.map((player) => {
                return (
                  <option key={player.id} value={player.id}>
                    {player.discordName}
                  </option>
                );
              })}
            </select>
            <SubmitButton
              variant="outlined"
              _action="ADD_TRUSTED"
              disabled={!trustedUser}
              icon={<PlusIcon />}
            />
          </div>
        </fetcher.Form>
      ) : null}
      <div>
        <label htmlFor="invite">{t("q:looking.groups.adder.inviteLink")}</label>
        <div className="stack horizontal sm items-center">
          <input
            type="text"
            value={inviteLink}
            readOnly
            id="invite"
            className="q__member-adder__input"
          />
          <Button
            variant={copySuccess ? "outlined-success" : "outlined"}
            onClick={() => copyToClipboard(inviteLink)}
            icon={copySuccess ? <CheckmarkIcon /> : <ClipboardIcon />}
            aria-label="Copy to clipboard"
          />
        </div>
      </div>
    </div>
  );
}
