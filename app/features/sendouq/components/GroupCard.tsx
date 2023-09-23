import { useFetcher } from "@remix-run/react";
import clsx from "clsx";
import { Avatar } from "~/components/Avatar";
import { Button } from "~/components/Button";
import { FormWithConfirm } from "~/components/FormWithConfirm";
import { Image, TierImage, WeaponImage } from "~/components/Image";
import { Popover } from "~/components/Popover";
import { SubmitButton } from "~/components/SubmitButton";
import { MicrophoneIcon } from "~/components/icons/Microphone";
import { SpeakerIcon } from "~/components/icons/Speaker";
import { SpeakerXIcon } from "~/components/icons/SpeakerX";
import type { Group, GroupMember as GroupMemberType } from "~/db/types";
import { ordinalToRoundedSp } from "~/features/mmr/mmr-utils";
import type { TieredSkill } from "~/features/mmr/tiered.server";
import { useTranslation } from "~/hooks/useTranslation";
import { useUser } from "~/modules/auth";
import { languagesUnified } from "~/modules/i18n/config";
import { SENDOUQ_LOOKING_PAGE, navIconUrl } from "~/utils/urls";
import { FULL_GROUP_SIZE } from "../q-constants";
import type { LookingGroup } from "../q-types";
import { StarIcon } from "~/components/icons/Star";
import { StarFilledIcon } from "~/components/icons/StarFilled";

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
    <section className="q__group">
      {/* {mapListPreference ? (
          <div className="stack lg horizontal justify-center">
            <div className="stack xs horizontal items-center">
              <ModePreferenceIcons preference={mapListPreference} />
            </div>
          </div>
        ) : null} */}
      <div
        className={clsx("stack md", {
          "horizontal justify-center": !group.members,
        })}
      >
        {group.members?.map((member) => {
          return (
            <GroupMember
              member={member}
              showActions={ownGroup && ownRole === "OWNER"}
              key={member.discordId}
            />
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
          >
            {action === "MATCH_UP"
              ? "Start match"
              : action === "LIKE" && !group.members
              ? "Challenge"
              : action === "LIKE"
              ? "Invite"
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
  );
}

function GroupMember({
  member,
  showActions,
}: {
  member: NonNullable<LookingGroup["members"]>[number];
  showActions: boolean;
}) {
  return (
    <div className="stack xxs">
      <div className="q__group-member">
        <Avatar user={member} size="xs" />
        <span className="q__group-member__name">{member.discordName}</span>
        <div className="ml-auto stack horizontal sm items-center">
          {showActions ? <MemberRoleManager member={member} /> : null}
          {member.skill ? <TierInfo skill={member.skill} /> : null}
        </div>
      </div>
      <div className="stack horizontal justify-between">
        <div className="stack horizontal xxs">
          {member.vc ? (
            <div className="q__group-member__extra-info">
              <VoiceChatInfo member={member} />
            </div>
          ) : null}
          {member.plusTier ? (
            <div className="q__group-member__extra-info">
              <Image path={navIconUrl("plus")} width={20} height={20} alt="" />
              {member.plusTier}
            </div>
          ) : null}
        </div>
        {member.weapons ? (
          <div className="q__group-member__extra-info">
            {member.weapons?.map((weapon) => {
              return (
                <WeaponImage
                  key={weapon}
                  weaponSplId={weapon}
                  variant="badge"
                  size={26}
                />
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MemberRoleManager({
  member,
}: {
  member: NonNullable<LookingGroup["members"]>[number];
}) {
  const fetcher = useFetcher();
  const { t } = useTranslation(["q"]);
  const Icon = member.role === "OWNER" ? StarFilledIcon : StarIcon;

  return (
    <Popover
      buttonChildren={
        <Icon
          className={clsx("q__group-member__star", {
            "q__group-member__star__inactive": member.role === "REGULAR",
          })}
        />
      }
    >
      <div className="stack md items-center">
        <div>{t(`q:roles.${member.role}`)}</div>
        {member.role !== "OWNER" ? (
          <fetcher.Form method="post" action={SENDOUQ_LOOKING_PAGE}>
            <input type="hidden" name="userId" value={member.id} />
            {member.role === "REGULAR" ? (
              <SubmitButton
                variant="minimal"
                size="tiny"
                _action="GIVE_MANAGER"
                state={fetcher.state}
              >
                Give manager
              </SubmitButton>
            ) : null}
            {member.role === "MANAGER" ? (
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
        ) : null}
      </div>
    </Popover>
  );
}

function TierInfo({ skill }: { skill: TieredSkill }) {
  return (
    <div className="q__group-member__tier">
      <Popover buttonChildren={<TierImage tier={skill.tier} width={38} />}>
        <div className="stack sm items-center">
          <TierImage tier={skill.tier} width={80} />
          <div className="text-lighter text-xxs">
            {skill.tier.name}
            {skill.tier.isPlus ? "+" : ""}
          </div>
          {!skill.approximate ? (
            <> {ordinalToRoundedSp(skill.ordinal)}SP</>
          ) : null}
        </div>
      </Popover>
    </div>
  );
}

function VoiceChatInfo({
  member,
}: {
  member: NonNullable<LookingGroup["members"]>[number];
}) {
  const user = useUser();
  const { t } = useTranslation(["q"]);

  if (!member.languages || !member.vc) return null;

  const Icon =
    member.vc === "YES"
      ? MicrophoneIcon
      : member.vc === "LISTEN_ONLY"
      ? SpeakerIcon
      : SpeakerXIcon;

  const color = () => {
    const languagesMatch =
      // small hack to show green for yourself always to avoid confusion
      // might show red because root loaders don't reload
      // till there is a full page refresh
      member.id === user?.id ||
      member.languages?.some((l) => user?.languages.includes(l));

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
