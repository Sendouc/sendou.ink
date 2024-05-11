import { Avatar } from "~/components/Avatar";
import type { LFGLoaderData } from "../routes/lfg";
import { Image, WeaponImage } from "~/components/Image";
import { Flag } from "~/components/Flag";
import { Button } from "~/components/Button";
import React from "react";
import clsx from "clsx";
import { hourDifferenceBetweenTimezones } from "../core/timezone";
import { databaseTimestampToDate } from "~/utils/dates";
import { useTranslation } from "react-i18next";
import { navIconUrl } from "~/utils/urls";

type Post = LFGLoaderData["posts"][number];

export function LFGPost({ post }: { post: Post }) {
  return (
    <div className="lfg-post__wide-layout">
      <div className="stack sm">
        <PostUserHeader author={post.author} />
        <PostTime createdAt={post.createdAt} updatedAt={post.updatedAt} />
        <PostPills post={post} />
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

function PostPills({ post }: { post: Post }) {
  return (
    <div className="stack sm horizontal">
      <PostTimezonePill timezone={post.timezone} />
      {typeof post.author.plusTier === "number" ? (
        <PostPlusServerPill plusTier={post.author.plusTier} />
      ) : null}
      {typeof post.author.languages === "string" ? (
        <PostLanguagePill languages={post.author.languages} />
      ) : null}
    </div>
  );
}

function PostSkillPill() {}

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
