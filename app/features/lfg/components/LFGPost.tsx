import { Avatar } from "~/components/Avatar";
import type { LFGLoaderData, TiersMap } from "../routes/lfg";
import { Image, TierImage, WeaponImage } from "~/components/Image";
import { Flag } from "~/components/Flag";
import { Button } from "~/components/Button";
import React from "react";
import clsx from "clsx";
import { hourDifferenceBetweenTimezones } from "../core/timezone";
import { databaseTimestampToDate } from "~/utils/dates";
import { useTranslation } from "react-i18next";
import { navIconUrl, userSubmittedImage } from "~/utils/urls";
import { currentOrPreviousSeason } from "~/features/mmr/season";
import type { TieredSkill } from "~/features/mmr/tiered.server";
import { useIsMounted } from "~/hooks/useIsMounted";
import { formatDistanceToNow } from "date-fns";
import { Divider } from "~/components/Divider";

type Post = LFGLoaderData["posts"][number];

export function LFGPost({
  post,
  tiersMap,
}: {
  post: Post;
  tiersMap: TiersMap;
}) {
  if (post.team) {
    return (
      <TeamLFGPost post={{ ...post, team: post.team }} tiersMap={tiersMap} />
    );
  }

  return <UserLFGPost post={post} tiersMap={tiersMap} />;
}

const USER_POST_EXPANDABLE_CRITERIA = 500;
function UserLFGPost({ post, tiersMap }: { post: Post; tiersMap: TiersMap }) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="lfg-post__wide-layout">
      <div className="lfg-post__wide-layout__left-row">
        <PostUserHeader author={post.author} />
        <PostTime createdAt={post.createdAt} updatedAt={post.updatedAt} />
        <PostPills
          languages={post.author.languages}
          plusTier={post.author.plusTier}
          timezone={post.timezone}
          tiers={tiersMap.get(post.author.id)}
        />
      </div>
      <div>
        <PostTextTypeHeader type={post.type} />
        <PostExpandableText
          text={post.text}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          expandableCriteria={USER_POST_EXPANDABLE_CRITERIA}
        />
      </div>
    </div>
  );
}

// xxx: no skills for sendou?
function TeamLFGPost({
  post,
  tiersMap,
}: {
  post: Post & { team: NonNullable<Post["team"]> };
  tiersMap: TiersMap;
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="lfg-post__wide-layout">
      <div className="stack md">
        <div className="stack xs">
          <div className="stack horizontal items-center justify-between">
            <PostTeamLogoHeader team={post.team} />
            <PostTimezonePill timezone={post.timezone} />
          </div>
          <Divider />
          <PostTime createdAt={post.createdAt} updatedAt={post.updatedAt} />
        </div>
        {isExpanded ? (
          <PostTeamMembersFull team={post.team} tiersMap={tiersMap} />
        ) : (
          <PostTeamMembersPeek team={post.team} tiersMap={tiersMap} />
        )}
      </div>
      <div>
        <PostTextTypeHeader type={post.type} />
        <PostExpandableText
          text={post.text}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />
      </div>
    </div>
  );
}

function PostTeamLogoHeader({ team }: { team: NonNullable<Post["team"]> }) {
  return (
    <div className="stack horizontal sm items-center font-bold">
      {team.avatarUrl ? (
        <Avatar size="xs" url={userSubmittedImage(team.avatarUrl)} />
      ) : null}
      {team.name}
    </div>
  );
}

function PostTeamMembersPeek({
  team,
  tiersMap,
}: {
  team: NonNullable<Post["team"]>;
  tiersMap: TiersMap;
}) {
  return (
    <div className="stack sm xs-row horizontal flex-wrap">
      {team.members.map((member) => (
        <PostTeamMember key={member.id} member={member} tiersMap={tiersMap} />
      ))}
    </div>
  );
}

function PostTeamMembersFull({
  team,
  tiersMap,
}: {
  team: NonNullable<Post["team"]>;
  tiersMap: TiersMap;
}) {
  return (
    <div className="stack lg">
      {team.members.map((member) => (
        <div key={member.id} className="stack sm">
          <PostUserHeader author={member} />
          <PostPills
            languages={member.languages}
            plusTier={member.plusTier}
            tiers={tiersMap.get(member.id)}
          />
        </div>
      ))}
    </div>
  );
}

function PostTeamMember({
  member,
  tiersMap,
}: {
  member: NonNullable<Post["team"]>["members"][number];
  tiersMap: TiersMap;
}) {
  const tiers = tiersMap.get(member.id);
  const tier = tiers?.latest ?? tiers?.previous;

  return (
    <div className="stack sm items-center flex-same-size">
      <div className="stack sm items-center">
        <Avatar size="xs" user={member} />
        <div className="lfg__post-team-member-name">{member.discordName}</div>
        {tier ? <TierImage tier={tier} width={32} /> : null}
      </div>
    </div>
  );
}

function PostUserHeader({ author }: { author: Post["author"] }) {
  return (
    <div className="stack sm horizontal items-center">
      <Avatar size="xsm" user={author} />
      <div>
        <div className="stack horizontal sm items-center text-md font-bold">
          <span className="lfg__post-user-name">{author.discordName}</span>{" "}
          {author.country ? <Flag countryCode={author.country} tiny /> : null}
        </div>
        <div className="stack horizontal sm">
          {author.weaponPool.map(({ weaponSplId }) => (
            <WeaponImage
              key={weaponSplId}
              weaponSplId={weaponSplId}
              size={26}
              variant="build"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PostTime({
  createdAt,
  updatedAt,
}: {
  createdAt: number;
  updatedAt: number;
}) {
  const { i18n } = useTranslation();

  const createdAtDate = databaseTimestampToDate(createdAt);
  const updatedAtDate = databaseTimestampToDate(updatedAt);
  const overDayDifferenceBetween =
    createdAtDate.getTime() - updatedAtDate.getTime() > 1000 * 60 * 60 * 24;

  return (
    <div className="text-lighter text-xs font-bold">
      {createdAtDate.toLocaleString(i18n.language, {
        month: "long",
        day: "numeric",
      })}{" "}
      {overDayDifferenceBetween ? (
        <i>
          (last active{" "}
          {formatDistanceToNow(updatedAtDate, {
            addSuffix: true,
          })}
          )
        </i>
      ) : null}
    </div>
  );
}

function PostPills({
  timezone,
  plusTier,
  languages,
  tiers,
}: {
  timezone?: string | null;
  plusTier?: number | null;
  languages?: string | null;
  tiers?: NonNullable<ReturnType<TiersMap["get"]>>;
}) {
  const isMounted = useIsMounted();

  if (!isMounted) return null;

  return (
    <div className="stack sm xs-row horizontal flex-wrap">
      {typeof timezone === "string" && <PostTimezonePill timezone={timezone} />}
      {typeof plusTier === "number" && (
        <PostPlusServerPill plusTier={plusTier} />
      )}
      {tiers && <PostSkillPills tiers={tiers} />}
      {typeof languages === "string" && (
        <PostLanguagePill languages={languages} />
      )}
    </div>
  );
}

const currentSeasonNth = currentOrPreviousSeason(new Date())!.nth;

function PostSkillPills({
  tiers,
}: {
  tiers: NonNullable<ReturnType<TiersMap["get"]>>;
}) {
  const hasBoth = tiers.latest && tiers.previous;

  return (
    <div className="stack xxxs horizontal">
      {tiers.latest ? (
        <PostSkillPill
          seasonNth={currentSeasonNth}
          tier={tiers.latest}
          cut={hasBoth ? "END" : undefined}
        />
      ) : null}
      {tiers.previous ? (
        <PostSkillPill
          seasonNth={currentSeasonNth - 1}
          tier={tiers.previous}
          cut={hasBoth ? "START" : undefined}
        />
      ) : null}
    </div>
  );
}

function PostSkillPill({
  seasonNth,
  tier,
  cut,
}: {
  seasonNth: number;
  tier: TieredSkill["tier"];
  cut?: "START" | "END";
}) {
  return (
    <div
      className={clsx("lfg-post__pill", "lfg-post__tier-pill", {
        "lfg-post__tier-pill--start": cut === "START",
        "lfg-post__tier-pill--end": cut === "END",
      })}
    >
      S{seasonNth}
      <TierImage tier={tier} width={32} className="lfg-post__tier" />
    </div>
  );
}

function PostPlusServerPill({ plusTier }: { plusTier: number }) {
  return (
    <div className="lfg-post__pill">
      <Image alt="" path={navIconUrl("plus")} size={18} />
      {plusTier}
    </div>
  );
}

function PostTimezonePill({ timezone }: { timezone: string }) {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const diff = hourDifferenceBetweenTimezones(userTimezone, timezone);

  const textColorClass = () => {
    const absDiff = Math.abs(diff);

    if (absDiff <= 3) {
      return "text-success";
    } else if (absDiff <= 6) {
      return "text-warning";
    } else {
      return "text-error";
    }
  };

  return (
    <div title={timezone} className={clsx("lfg-post__pill", textColorClass())}>
      {diff === 0 ? "±" : ""}
      {diff > 0 ? "+" : ""}
      {diff}h
    </div>
  );
}

function PostLanguagePill({ languages }: { languages: string }) {
  return (
    <div className="lfg-post__pill">
      {languages.replace(/,/g, " / ").toUpperCase()}
    </div>
  );
}

function PostTextTypeHeader({ type }: { type: Post["type"] }) {
  const { t } = useTranslation(["lfg"]);

  return (
    <div className="text-xs text-lighter font-bold">
      {t(`lfg:types.${type}`)}
    </div>
  );
}

function PostExpandableText({
  text,
  isExpanded: _isExpanded,
  setIsExpanded,
  expandableCriteria,
}: {
  text: string;
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
  expandableCriteria?: number;
}) {
  const isExpandable = expandableCriteria && text.length > expandableCriteria;

  const isExpanded = !isExpandable ? true : _isExpanded;

  return (
    <div
      className={clsx({
        "lfg__post-text-container": !isExpanded,
        "lfg__post-text-container--expanded": isExpanded,
      })}
    >
      <div className="lfg__post-text">{text}</div>
      {isExpandable ? (
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          className={clsx("lfg__post-text__show-all-button", {
            "lfg__post-text__show-all-button--expanded": isExpanded,
          })}
          variant="outlined"
          size="tiny"
        >
          {isExpanded ? "Show less" : "Show more"}
        </Button>
      ) : null}
      {!isExpanded ? <div className="lfg__post-text-cut" /> : null}
    </div>
  );
}
