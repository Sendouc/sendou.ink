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
import { navIconUrl } from "~/utils/urls";
import { currentOrPreviousSeason } from "~/features/mmr/season";
import type { TieredSkill } from "~/features/mmr/tiered.server";
import { useIsMounted } from "~/hooks/useIsMounted";

type Post = LFGLoaderData["posts"][number];

export function LFGPost({
  post,
  tiersMap,
}: {
  post: Post;
  tiersMap: TiersMap;
}) {
  return (
    <div className="lfg-post__wide-layout">
      <div className="lfg-post__wide-layout__left-row">
        <PostUserHeader author={post.author} />
        <PostTime createdAt={post.createdAt} updatedAt={post.updatedAt} />
        <PostPills post={post} tiersMap={tiersMap} />
      </div>
      <div>
        <PostTextTypeHeader type={post.type} />
        <PostExpandableText text={post.text} />
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

  return (
    <div className="text-lighter text-xs font-bold">
      {databaseTimestampToDate(createdAt).toLocaleString(i18n.language, {
        month: "long",
        day: "numeric",
        hour: "numeric",
      })}
    </div>
  );
}

function PostPills({ post, tiersMap }: { post: Post; tiersMap: TiersMap }) {
  const tiers = tiersMap.get(post.author.id);
  const isMounted = useIsMounted();

  if (!isMounted) return null;

  return (
    <div className="stack sm xs-row horizontal flex-wrap">
      <PostTimezonePill timezone={post.timezone} />
      {typeof post.author.plusTier === "number" ? (
        <PostPlusServerPill plusTier={post.author.plusTier} />
      ) : null}
      {tiers ? <PostSkillPills tiers={tiers} /> : null}
      {typeof post.author.languages === "string" ? (
        <PostLanguagePill languages={post.author.languages} />
      ) : null}
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

const EXPANDABLE_CRITERIA = 500;
function PostExpandableText({ text }: { text: string }) {
  const isExpandable = text.length > EXPANDABLE_CRITERIA;

  const [expanded, setExpanded] = React.useState(!isExpandable);

  return (
    <div
      className={clsx({
        "lfg__post-text-container": !expanded,
        "lfg__post-text-container--expanded": expanded,
      })}
    >
      <div className="lfg__post-text">{text}</div>
      {isExpandable ? (
        <Button
          onClick={() => setExpanded((prev) => !prev)}
          className={clsx("lfg__post-text__show-all-button", {
            "lfg__post-text__show-all-button--expanded": expanded,
          })}
          variant="outlined"
          size="tiny"
        >
          {expanded ? "Show less" : "Show more"}
        </Button>
      ) : null}
      {!expanded ? <div className="lfg__post-text-cut" /> : null}
    </div>
  );
}
