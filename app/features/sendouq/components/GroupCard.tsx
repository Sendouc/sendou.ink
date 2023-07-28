import { Link, useFetcher } from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import { Flipped } from "react-flip-toolkit";
import { Avatar } from "~/components/Avatar";
import { Button } from "~/components/Button";
import { FormWithConfirm } from "~/components/FormWithConfirm";
import { Image, WeaponImage } from "~/components/Image";
import { SubmitButton } from "~/components/SubmitButton";
import { ArrowsPointingInIcon } from "~/components/icons/ArrowsPointingIn";
import { StarFilledIcon } from "~/components/icons/StarFilled";
import UndoIcon from "~/components/icons/Undo";
import { UsersIcon } from "~/components/icons/Users";
import type { Group, GroupMember as GroupMemberType } from "~/db/types";
import { SENDOUQ_LOOKING_PAGE, tierImageUrl, userPage } from "~/utils/urls";
import { FULL_GROUP_SIZE } from "../q-constants";
import type { LookingGroup } from "../q-types";
import { ModePreferenceIcons } from "./ModePrefenceIcons";
import { ordinalToRoundedSp } from "~/features/mmr/mmr-utils";

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
                  {member.weapons ? (
                    <div className="q__group-member-weapons">
                      {member.weapons.map((weapon) => {
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
                  ) : null}
                  {member.skill ? (
                    <div className="text-xs font-bold text-lighter stack horizontal xxs items-center">
                      <Image
                        path={tierImageUrl(member.skill.tier.name)}
                        alt={member.skill.tier.name}
                        title={member.skill.tier.name}
                        width={36}
                      />
                      {!member.skill.approximate ? (
                        <>{ordinalToRoundedSp(member.skill.ordinal)}SP</>
                      ) : null}
                    </div>
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
          <div className="stack xs horizontal text-lighter font-bold items-center justify-center text-sm">
            <Image
              path={tierImageUrl(group.tier.name)}
              alt={group.tier.name}
              title={group.tier.name}
              width={48}
            />
            {group.tier.name}
            {group.tier.isPlus ? "+" : ""}
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
