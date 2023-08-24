import { Link, useFetcher } from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import { Flipped } from "react-flip-toolkit";
import { Avatar } from "~/components/Avatar";
import { Button } from "~/components/Button";
import { FormWithConfirm } from "~/components/FormWithConfirm";
import { TierImage, WeaponImage } from "~/components/Image";
import { SubmitButton } from "~/components/SubmitButton";
import { ArrowsPointingInIcon } from "~/components/icons/ArrowsPointingIn";
import { StarFilledIcon } from "~/components/icons/StarFilled";
import UndoIcon from "~/components/icons/Undo";
import { UsersIcon } from "~/components/icons/Users";
import type { Group, GroupMember as GroupMemberType } from "~/db/types";
import { SENDOUQ_LOOKING_PAGE, TIERS_PAGE, userPage } from "~/utils/urls";
import { FULL_GROUP_SIZE } from "../q-constants";
import type { LookingGroup } from "../q-types";
import { ModePreferenceIcons } from "./ModePrefenceIcons";
import { ordinalToRoundedSp } from "~/features/mmr/mmr-utils";
import { Popover } from "~/components/Popover";
import { SpeakerIcon } from "~/components/icons/Speaker";
import { MicrophoneIcon } from "~/components/icons/Microphone";
import { SpeakerXIcon } from "~/components/icons/SpeakerX";
import { useTranslation } from "~/hooks/useTranslation";
import { languagesUnified } from "~/modules/i18n/config";
import { useUser } from "~/modules/auth";

export function GroupCard({
  group,
  action,
  mapListPreference,
  ownRole,
  ownGroup = false,
}: {
  group: LookingGroup;
  action?: "LIKE" | "UNLIKE" | "GROUP_UP" | "MATCH_UP";
  mapListPreference?: Group["mapListPreference"];
  ownRole?: GroupMemberType["role"];
  ownGroup?: boolean;
}) {
  const fetcher = useFetcher();

  return (
    <Flipped flipId={group.id}>
      <section className="q__group">
        {mapListPreference ? (
          <div className="stack lg horizontal justify-center">
            <div className="stack xs horizontal items-center">
              <ModePreferenceIcons preference={mapListPreference} />
            </div>
          </div>
        ) : null}
        <div
          className={clsx("stack sm", {
            "horizontal justify-center": !group.members,
          })}
        >
          {group.members?.map((member) => {
            return (
              <React.Fragment key={member.discordId}>
                <GroupMember
                  member={member}
                  showActions={ownGroup && ownRole === "OWNER"}
                />
                <div className="stack md horizontal items-center justify-between">
                  <div className="q__group-member-weapons">
                    {member.weapons?.map((weapon) => {
                      return (
                        <WeaponImage
                          key={weapon}
                          weaponSplId={weapon}
                          variant="badge"
                          size={36}
                          className="q__group-member-weapon"
                        />
                      );
                    })}
                  </div>
                  {member.skill ? (
                    <Popover
                      buttonChildren={
                        <div className="text-xs font-bold text-lighter stack horizontal xxs items-center">
                          <TierImage tier={member.skill.tier} width={36} />
                          {!member.skill.approximate ? (
                            <>{ordinalToRoundedSp(member.skill.ordinal)}SP</>
                          ) : null}
                        </div>
                      }
                    >
                      <div className="stack sm items-center">
                        <TierImage tier={member.skill.tier} width={100} />
                        <div>
                          {member.skill.tier.name}
                          {member.skill.tier.isPlus ? "+" : ""}
                        </div>
                        <Link
                          to={TIERS_PAGE}
                          className="text-xs"
                          target="_blank"
                          rel="noreferrer"
                        >
                          See all tiers
                        </Link>
                      </div>
                    </Popover>
                  ) : null}
                </div>
              </React.Fragment>
            );
          })}
          {!group.members
            ? new Array(FULL_GROUP_SIZE).fill(null).map((_, i) => {
                return (
                  <div key={i} className="q__member-placeholder">
                    ?
                  </div>
                );
              })
            : null}
        </div>
        {group.tier ? (
          <div className="stack xs text-lighter font-bold items-center justify-center text-xs">
            <TierImage tier={group.tier} width={100} />
            <div>
              {group.tier.name}
              {group.tier.isPlus ? "+" : ""}{" "}
              {group.isReplay ? (
                <>
                  / <span className="text-theme-secondary">REPLAY</span>
                </>
              ) : null}
            </div>
          </div>
        ) : null}
        {action && (ownRole === "OWNER" || ownRole === "MANAGER") ? (
          <fetcher.Form className="stack items-center" method="post">
            <input type="hidden" name="targetGroupId" value={group.id} />
            <SubmitButton
              size="tiny"
              variant={action === "UNLIKE" ? "destructive" : "outlined"}
              _action={action}
              state={fetcher.state}
              icon={
                action === "MATCH_UP" ? (
                  <ArrowsPointingInIcon />
                ) : action === "LIKE" ? (
                  <StarFilledIcon />
                ) : action === "GROUP_UP" ? (
                  <UsersIcon />
                ) : (
                  <UndoIcon />
                )
              }
            >
              {action === "MATCH_UP"
                ? "Start match"
                : action === "LIKE" && !group.members
                ? "Challenge"
                : action === "LIKE"
                ? "Ask to play"
                : action === "GROUP_UP"
                ? "Group up"
                : "Undo"}
            </SubmitButton>
          </fetcher.Form>
        ) : null}
        {ownGroup ? (
          <FormWithConfirm
            dialogHeading="Leave this group?"
            fields={[["_action", "LEAVE_GROUP"]]}
            deleteButtonText="Leave"
            action={SENDOUQ_LOOKING_PAGE}
          >
            <Button variant="minimal-destructive" size="tiny">
              Leave group
            </Button>
          </FormWithConfirm>
        ) : null}
      </section>
    </Flipped>
  );
}

function GroupMember({
  member,
  showActions,
}: {
  member: NonNullable<LookingGroup["members"]>[number];
  showActions: boolean;
}) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form
      className="stack sm horizontal items-center font-bold"
      method="post"
      action={SENDOUQ_LOOKING_PAGE}
    >
      <input type="hidden" name="userId" value={member.id} />
      <Link to={userPage(member)} className="q__group-member" target="_blank">
        <Avatar user={member} size="xxs" />
        {member.discordName}
      </Link>
      {member.plusTier ? (
        <div className="text-xs text-lighter">+{member.plusTier}</div>
      ) : null}
      <VoiceChatInfo member={member} />
      {member.role === "REGULAR" && showActions ? (
        <SubmitButton
          variant="minimal"
          size="tiny"
          _action="GIVE_MANAGER"
          state={fetcher.state}
        >
          Give manager
        </SubmitButton>
      ) : null}
      {member.role === "MANAGER" && showActions ? (
        <SubmitButton
          variant="minimal-destructive"
          size="tiny"
          _action="REMOVE_MANAGER"
          state={fetcher.state}
        >
          Remove manager
        </SubmitButton>
      ) : null}
    </fetcher.Form>
  );
}

function VoiceChatInfo({
  member,
}: {
  member: NonNullable<LookingGroup["members"]>[number];
}) {
  const user = useUser();
  const { t } = useTranslation(["q"]);

  const Icon =
    member.vc === "YES"
      ? MicrophoneIcon
      : member.vc === "LISTEN_ONLY"
      ? SpeakerIcon
      : SpeakerXIcon;

  const color = () => {
    const languagesMatch = member.languages.some((l) =>
      user?.languages.includes(l)
    );

    if (!languagesMatch) return "text-error";

    return member.vc === "YES"
      ? "text-success"
      : member.vc === "LISTEN_ONLY"
      ? "text-warning"
      : "text-error";
  };

  const languageToFull = (code: string) =>
    languagesUnified.find((l) => l.code === code)?.name ?? "";

  const languagesString =
    member.languages.length > 0
      ? `(${member.languages.map(languageToFull).join(", ")})`
      : null;

  return (
    <Popover
      buttonChildren={
        <Icon className={clsx("q__group-member-vc-icon", color())} />
      }
      triggerClassName="minimal tiny"
      containerClassName="ml-auto"
    >
      {t(`q:vc.${member.vc}`)} {languagesString}
    </Popover>
  );
}
