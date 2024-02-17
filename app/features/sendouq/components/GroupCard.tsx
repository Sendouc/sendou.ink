import { Link, useFetcher } from "@remix-run/react";
import clsx from "clsx";
import { Avatar } from "~/components/Avatar";
import { Button, LinkButton } from "~/components/Button";
import { Image, ModeImage, TierImage, WeaponImage } from "~/components/Image";
import { Popover } from "~/components/Popover";
import { SubmitButton } from "~/components/SubmitButton";
import { MicrophoneIcon } from "~/components/icons/Microphone";
import { SpeakerIcon } from "~/components/icons/Speaker";
import { SpeakerXIcon } from "~/components/icons/SpeakerX";
import type { GroupMember as GroupMemberType, ParsedMemento } from "~/db/types";
import { ordinalToRoundedSp } from "~/features/mmr/mmr-utils";
import type { TieredSkill } from "~/features/mmr/tiered.server";
import { useTranslation } from "react-i18next";
import { useUser } from "~/features/auth/core";
import { languagesUnified } from "~/modules/i18n/config";
import {
  SENDOUQ_LOOKING_PAGE,
  TIERS_PAGE,
  navIconUrl,
  tierImageUrl,
  userPage,
} from "~/utils/urls";
import { FULL_GROUP_SIZE, SENDOUQ } from "../q-constants";
import type { LookingGroup } from "../q-types";
import { StarIcon } from "~/components/icons/Star";
import { StarFilledIcon } from "~/components/icons/StarFilled";
import { inGameNameWithoutDiscriminator } from "~/utils/strings";
import * as React from "react";
import type { SqlBool } from "kysely";
import { MATCHES_COUNT_NEEDED_FOR_LEADERBOARD } from "~/features/leaderboards/leaderboards-constants";
import { Flipped } from "react-flip-toolkit";
import { EditIcon } from "~/components/icons/Edit";
import { databaseTimestampToDate } from "~/utils/dates";
import { FormWithConfirm } from "~/components/FormWithConfirm";
import { TrashIcon } from "~/components/icons/Trash";
import { InfoPopover } from "~/components/InfoPopover";

export function GroupCard({
  group,
  action,
  ownRole,
  ownGroup = false,
  isExpired = false,
  displayOnly = false,
  hideVc = false,
  hideWeapons = false,
  hideNote: _hidenote = false,
  enableKicking,
  showAddNote,
  showNote = false,
}: {
  group: Omit<LookingGroup, "createdAt" | "chatCode">;
  action?: "LIKE" | "UNLIKE" | "GROUP_UP" | "MATCH_UP";
  ownRole?: GroupMemberType["role"];
  ownGroup?: boolean;
  isExpired?: boolean;
  displayOnly?: boolean;
  hideVc?: SqlBool;
  hideWeapons?: SqlBool;
  hideNote?: boolean;
  enableKicking?: boolean;
  showAddNote?: SqlBool;
  showNote?: boolean;
}) {
  const { t } = useTranslation(["q"]);
  const user = useUser();
  const fetcher = useFetcher();

  const hideNote =
    displayOnly ||
    !group.members ||
    group.members.length === FULL_GROUP_SIZE ||
    _hidenote;

  return (
    <GroupCardContainer groupId={group.id} ownGroup={ownGroup}>
      <section
        className={clsx("q__group", { "q__group__display-only": displayOnly })}
      >
        {group.members ? (
          <div className="stack md">
            {group.members.map((member) => {
              return (
                <GroupMember
                  member={member}
                  showActions={ownGroup && ownRole === "OWNER"}
                  key={member.discordId}
                  displayOnly={displayOnly}
                  hideVc={hideVc}
                  hideWeapons={hideWeapons}
                  hideNote={hideNote}
                  enableKicking={enableKicking}
                  showNote={showNote}
                  showAddNote={showAddNote && member.id !== user?.id}
                />
              );
            })}
          </div>
        ) : null}
        {group.futureMatchModes ? (
          <div className="stack horizontal sm justify-center">
            {group.futureMatchModes.map((mode) => {
              return (
                <div key={mode} className="q__group__future-match-mode">
                  <ModeImage mode={mode} />
                </div>
              );
            })}
          </div>
        ) : null}
        {group.tier && !displayOnly ? (
          <div className="stack xs text-lighter font-bold items-center justify-center text-xs">
            <TierImage tier={group.tier} width={100} />
            <div>
              {group.tier.name}
              {group.tier.isPlus ? "+" : ""}{" "}
              {group.isReplay ? (
                <>
                  /{" "}
                  <span className="text-theme-secondary text-uppercase">
                    {t("q:looking.replay")}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        ) : null}
        {group.tier && displayOnly ? (
          <div className="q__group__display-group-tier">
            <TierImage tier={group.tier} width={38} />
            {group.tier.name}
            {group.tier.isPlus ? "+" : ""}
          </div>
        ) : null}
        {group.skillDifference ? (
          <GroupSkillDifference skillDifference={group.skillDifference} />
        ) : null}
        {action &&
        (ownRole === "OWNER" || ownRole === "MANAGER") &&
        !isExpired ? (
          <fetcher.Form className="stack items-center" method="post">
            <input type="hidden" name="targetGroupId" value={group.id} />
            <SubmitButton
              size="tiny"
              variant={action === "UNLIKE" ? "destructive" : "outlined"}
              _action={action}
              state={fetcher.state}
            >
              {action === "MATCH_UP"
                ? t("q:looking.groups.actions.startMatch")
                : action === "LIKE" && !group.members
                  ? t("q:looking.groups.actions.challenge")
                  : action === "LIKE"
                    ? t("q:looking.groups.actions.invite")
                    : action === "GROUP_UP"
                      ? t("q:looking.groups.actions.groupUp")
                      : t("q:looking.groups.actions.undo")}
            </SubmitButton>
          </fetcher.Form>
        ) : null}
      </section>
    </GroupCardContainer>
  );
}

function GroupCardContainer({
  ownGroup,
  groupId,
  children,
}: {
  ownGroup: boolean;
  groupId: number;
  children: React.ReactNode;
}) {
  // we don't want it to animate
  if (ownGroup) return <>{children}</>;

  return <Flipped flipId={groupId}>{children}</Flipped>;
}

function GroupMember({
  member,
  showActions,
  displayOnly,
  hideVc,
  hideWeapons,
  hideNote,
  enableKicking,
  showAddNote,
  showNote,
}: {
  member: NonNullable<LookingGroup["members"]>[number];
  showActions: boolean;
  displayOnly?: boolean;
  hideVc?: SqlBool;
  hideWeapons?: SqlBool;
  hideNote?: boolean;
  enableKicking?: boolean;
  showAddNote?: SqlBool;
  showNote?: boolean;
}) {
  const { t, i18n } = useTranslation(["q", "user"]);
  const user = useUser();

  return (
    <div className="stack xxs">
      <div className="q__group-member">
        <div className="text-main-forced stack xs horizontal items-center">
          {showNote && member.privateNote ? (
            <Popover
              buttonChildren={
                <>
                  <Avatar
                    user={member}
                    size="xs"
                    className={clsx(
                      "q__group-member__avatar",
                      `q__group-member__avatar__${member.privateNote.sentiment}`,
                    )}
                  />
                </>
              }
            >
              {member.privateNote.text}
              <div
                className={clsx(
                  "stack sm horizontal justify-between items-center",
                  { "mt-2": member.privateNote.text },
                )}
              >
                <div className="text-xxs text-lighter">
                  {databaseTimestampToDate(
                    member.privateNote.updatedAt,
                  ).toLocaleString(i18n.language, {
                    hour: "numeric",
                    minute: "numeric",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <DeletePrivateNoteForm
                  name={member.discordName}
                  targetId={member.id}
                />
              </div>
            </Popover>
          ) : (
            <Avatar user={member} size="xs" />
          )}
          <Link
            to={userPage(member)}
            className="q__group-member__name"
            target="_blank"
          >
            {member.inGameName ? (
              <>
                <span className="text-lighter font-bold text-xxxs">
                  {t("user:ign.short")}:
                </span>{" "}
                {inGameNameWithoutDiscriminator(member.inGameName)}
              </>
            ) : (
              member.discordName
            )}
          </Link>
        </div>
        <div className="ml-auto stack horizontal sm items-center">
          {showActions || displayOnly ? (
            <MemberRoleManager
              member={member}
              displayOnly={displayOnly}
              enableKicking={enableKicking}
            />
          ) : null}
          {member.skill ? <TierInfo skill={member.skill} /> : null}
        </div>
      </div>
      <div className="stack horizontal justify-between">
        <div className="stack horizontal xxs">
          {member.vc && !hideVc ? (
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
          {member.friendCode ? (
            <InfoPopover>SW-{member.friendCode}</InfoPopover>
          ) : null}
          {showAddNote ? (
            <LinkButton
              to={`?note=${member.id}`}
              icon={<EditIcon />}
              className={clsx("q__group-member__add-note-button", {
                "q__group-member__add-note-button__edit": member.privateNote,
              })}
            >
              {member.privateNote
                ? t("q:looking.groups.editNote")
                : t("q:looking.groups.addNote")}
            </LinkButton>
          ) : null}
        </div>
        {member.weapons && member.weapons.length > 0 && !hideWeapons ? (
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
        {member.skillDifference ? (
          <MemberSkillDifference skillDifference={member.skillDifference} />
        ) : null}
      </div>
      {!hideNote ? (
        <MemberNote note={member.note} editable={user?.id === member.id} />
      ) : null}
    </div>
  );
}

function MemberNote({
  note,
  editable,
}: {
  note?: string | null;
  editable: boolean;
}) {
  const { t } = useTranslation(["common", "q"]);
  const [editing, setEditing] = React.useState(false);

  const startEditing = () => {
    setEditing(true);
  };

  // when note updates exit editing mode
  React.useEffect(() => {
    setEditing(false);
  }, [note]);

  if (editing) {
    return (
      <AddPrivateNoteForm note={note} stopEditing={() => setEditing(false)} />
    );
  }

  if (note) {
    return (
      <div className="text-lighter text-center text-xs mt-1">
        {note}{" "}
        {editable ? (
          <Button
            size="miniscule"
            variant="minimal"
            onClick={startEditing}
            className="mt-2 ml-auto"
          >
            {t("q:looking.groups.editNote")}
          </Button>
        ) : null}
      </div>
    );
  }

  if (!editable) return null;

  return (
    <Button variant="minimal" size="miniscule" onClick={startEditing}>
      {t("q:looking.groups.addNote")}
    </Button>
  );
}

function AddPrivateNoteForm({
  note,
  stopEditing,
}: {
  note?: string | null;
  stopEditing: () => void;
}) {
  const fetcher = useFetcher();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const { t } = useTranslation(["common"]);
  const [value, setValue] = React.useState(note ?? "");

  const newValueLegal = value.length <= SENDOUQ.OWN_PUBLIC_NOTE_MAX_LENGTH;

  React.useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.focus();
    textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
      textareaRef.current.value.length;
  }, []);

  return (
    <fetcher.Form method="post" action={SENDOUQ_LOOKING_PAGE}>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={2}
        className="q__group-member__note-textarea mt-1"
        name="value"
        ref={textareaRef}
      />
      <div className="stack horizontal justify-between">
        <Button
          variant="minimal-destructive"
          size="miniscule"
          onClick={stopEditing}
        >
          {t("common:actions.cancel")}
        </Button>
        {newValueLegal ? (
          <SubmitButton
            _action="UPDATE_NOTE"
            variant="minimal"
            size="miniscule"
          >
            {t("common:actions.save")}
          </SubmitButton>
        ) : (
          <span className="text-warning text-xxs font-semi-bold">
            {value.length}/{SENDOUQ.OWN_PUBLIC_NOTE_MAX_LENGTH}
          </span>
        )}
      </div>
    </fetcher.Form>
  );
}

function DeletePrivateNoteForm({
  targetId,
  name,
}: {
  targetId: number;
  name: string;
}) {
  const { t } = useTranslation(["q"]);

  return (
    <FormWithConfirm
      dialogHeading={t("q:privateNote.delete.header", { name })}
      fields={[
        ["targetId", targetId],
        ["_action", "DELETE_PRIVATE_USER_NOTE"],
      ]}
    >
      <SubmitButton variant="minimal-destructive" size="tiny" type="submit">
        <TrashIcon className="build__icon" />
      </SubmitButton>
    </FormWithConfirm>
  );
}

function GroupSkillDifference({
  skillDifference,
}: {
  skillDifference: NonNullable<
    ParsedMemento["groups"][number]["skillDifference"]
  >;
}) {
  const { t } = useTranslation(["q"]);

  if (skillDifference.calculated) {
    return (
      <div className="text-center font-semi-bold">
        {t("q:looking.teamSP")} {skillDifference.oldSp} ➜{" "}
        {skillDifference.newSp}
      </div>
    );
  }

  if (skillDifference.newSp) {
    return (
      <div className="text-center font-semi-bold">
        {t("q:looking.teamSP.calculated")}: {skillDifference.newSp}
      </div>
    );
  }

  return (
    <div className="text-center font-semi-bold">
      {t("q:looking.teamSP.calculating")} ({skillDifference.matchesCount}/
      {skillDifference.matchesCountNeeded})
    </div>
  );
}

function MemberSkillDifference({
  skillDifference,
}: {
  skillDifference: NonNullable<
    ParsedMemento["users"][number]["skillDifference"]
  >;
}) {
  const { t } = useTranslation(["q"]);

  if (skillDifference.calculated) {
    if (skillDifference.spDiff === 0) return null;

    const symbol =
      skillDifference.spDiff > 0 ? (
        <span className="text-success">▲</span>
      ) : (
        <span className="text-warning">▼</span>
      );
    return (
      <div className="q__group-member__extra-info">
        {symbol}
        {Math.abs(skillDifference.spDiff)}SP
      </div>
    );
  }

  if (skillDifference.matchesCount === skillDifference.matchesCountNeeded) {
    return (
      <div className="q__group-member__extra-info">
        <span className="text-lighter">{t("q:looking.sp.calculated")}:</span>{" "}
        {skillDifference.newSp ? <>{skillDifference.newSp}SP</> : null}
      </div>
    );
  }

  return (
    <div className="q__group-member__extra-info">
      <span className="text-lighter">{t("q:looking.sp.calculating")}</span> (
      {skillDifference.matchesCount}/{skillDifference.matchesCountNeeded})
    </div>
  );
}

function MemberRoleManager({
  member,
  displayOnly,
  enableKicking,
}: {
  member: NonNullable<LookingGroup["members"]>[number];
  displayOnly?: boolean;
  enableKicking?: boolean;
}) {
  const loggedInUser = useUser();
  const fetcher = useFetcher();
  const { t } = useTranslation(["q"]);
  const Icon = member.role === "OWNER" ? StarFilledIcon : StarIcon;

  if (displayOnly && member.role !== "OWNER") return null;

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
      <div className="stack sm items-center">
        <div>{t(`q:roles.${member.role}`)}</div>
        {member.role !== "OWNER" && !displayOnly ? (
          <fetcher.Form
            method="post"
            action={SENDOUQ_LOOKING_PAGE}
            className="stack md items-center"
          >
            <input type="hidden" name="userId" value={member.id} />
            {member.role === "REGULAR" ? (
              <SubmitButton
                variant="outlined"
                size="tiny"
                _action="GIVE_MANAGER"
                state={fetcher.state}
              >
                {t("q:looking.groups.actions.giveManager")}
              </SubmitButton>
            ) : null}
            {member.role === "MANAGER" ? (
              <SubmitButton
                variant="destructive"
                size="tiny"
                _action="REMOVE_MANAGER"
                state={fetcher.state}
              >
                {t("q:looking.groups.actions.removeManager")}
              </SubmitButton>
            ) : null}
            {enableKicking && member.id !== loggedInUser?.id ? (
              <SubmitButton
                variant="destructive"
                size="tiny"
                _action="KICK_FROM_GROUP"
                state={fetcher.state}
              >
                {t("q:looking.groups.actions.kick")}
              </SubmitButton>
            ) : null}
          </fetcher.Form>
        ) : null}
      </div>
    </Popover>
  );
}

function TierInfo({ skill }: { skill: TieredSkill | "CALCULATING" }) {
  const { t } = useTranslation(["q"]);

  if (skill === "CALCULATING") {
    return (
      <div className="q__group-member__tier">
        <Popover
          buttonChildren={
            <Image
              path={tierImageUrl("CALCULATING")}
              alt=""
              height={32.965}
              className="q__group-member__tier__placeholder"
            />
          }
        >
          {t("q:looking.rankCalculating", {
            count: MATCHES_COUNT_NEEDED_FOR_LEADERBOARD,
          })}
        </Popover>
      </div>
    );
  }

  return (
    <div className="q__group-member__tier">
      <Popover buttonChildren={<TierImage tier={skill.tier} width={38} />}>
        <div className="stack sm items-center">
          <div className="stack items-center">
            <TierImage tier={skill.tier} width={80} />
            <div className="text-lighter text-xxs">
              {skill.tier.name}
              {skill.tier.isPlus ? "+" : ""}
            </div>
            <Link to={TIERS_PAGE} className="text-xxs" target="_blank">
              {t("q:looking.allTiers")}
            </Link>
          </div>
          {!skill.approximate ? (
            <div className="text-lg">
              {" "}
              {ordinalToRoundedSp(skill.ordinal)}
              <span className="text-lighter">SP</span>
            </div>
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
