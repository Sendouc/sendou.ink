import { Avatar } from "~/components/Avatar";
import type { LFGLoaderData } from "../routes/lfg";
import { WeaponImage } from "~/components/Image";
import { Flag } from "~/components/Flag";
import { Button } from "~/components/Button";
import React from "react";
import clsx from "clsx";

type Post = LFGLoaderData["posts"][number];

export function LFGPost({ post }: { post: Post }) {
  return (
    <div className="lfg-post__wide-layout">
      <PostUserHeader author={post.author} />
      <PostExpandableText text={post.text} />
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

function PostTime() {}

function PostPills() {}

function PostSkillPill() {}

function PostPlusServerPill() {}

function PostTimezonePill() {}

function PostLanguagePill() {}

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
