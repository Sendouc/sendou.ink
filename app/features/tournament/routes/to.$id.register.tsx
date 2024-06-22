import { Form, Link, useFetcher, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import Compressor from "compressorjs";
import Markdown from "markdown-to-jsx";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useCopyToClipboard } from "react-use";
import { Alert } from "~/components/Alert";
import { Avatar } from "~/components/Avatar";
import { Button, LinkButton } from "~/components/Button";
import { Divider } from "~/components/Divider";
import { FormWithConfirm } from "~/components/FormWithConfirm";
import { FriendCodeInput } from "~/components/FriendCodeInput";
import { Image, ModeImage } from "~/components/Image";
import { Input } from "~/components/Input";
import { Label } from "~/components/Label";
import { MapPoolStages } from "~/components/MapPoolSelector";
import { NewTabs } from "~/components/NewTabs";
import { Popover } from "~/components/Popover";
import { Section } from "~/components/Section";
import { SubmitButton } from "~/components/SubmitButton";
import { Toggle } from "~/components/Toggle";
import { CheckmarkIcon } from "~/components/icons/Checkmark";
import { ClockIcon } from "~/components/icons/Clock";
import { CrossIcon } from "~/components/icons/Cross";
import { DiscordIcon } from "~/components/icons/Discord";
import { UserIcon } from "~/components/icons/User";
import { useUser } from "~/features/auth/core/user";
import { imgTypeToDimensions } from "~/features/img-upload/upload-constants";
import { MapPool } from "~/features/map-list-generator/core/map-pool";
import { ModeMapPoolPicker } from "~/features/sendouq-settings/components/ModeMapPoolPicker";
import { type TournamentDataTeam } from "~/features/tournament-bracket/core/Tournament.server";
import { useAutoRerender } from "~/hooks/useAutoRerender";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useSearchParamState } from "~/hooks/useSearchParamState";
import { modesShort, rankedModesShort } from "~/modules/in-game-lists/modes";
import { filterOutFalsy } from "~/utils/arrays";
import invariant from "~/utils/invariant";
import {
  LOG_IN_URL,
  SENDOU_INK_BASE_URL,
  navIconUrl,
  readonlyMapsPage,
  tournamentJoinPage,
  tournamentSubsPage,
  userEditProfilePage,
  userPage,
  userSubmittedImage,
} from "~/utils/urls";
import { TOURNAMENT } from "../tournament-constants";
import {
  type CounterPickValidationStatus,
  validateCounterPickMapPool,
} from "../tournament-utils";
import { useTournament } from "./to.$id";
import type { TournamentRegisterPageLoader } from "../loaders/to.$id.register.server";
import { TrashIcon } from "~/components/icons/Trash";

import { loader } from "../loaders/to.$id.register.server";
import { action } from "../actions/to.$id.register.server";

export { loader, action };

// xxx: uploading avatar possible till reg ends

export default function TournamentRegisterPage() {
  const user = useUser();
  const isMounted = useIsMounted();
  const { i18n } = useTranslation();
  const tournament = useTournament();

  const startsAtEvenHour = tournament.ctx.startTime.getMinutes() === 0;

  const showAvatarPendingApprovalText =
    !tournament.ctx.logoUrl &&
    tournament.ctx.avatarImgId &&
    tournament.isOrganizer(user);

  return (
    <div className="stack lg">
      <div className="tournament__logo-container">
        <img
          src={tournament.logoSrc}
          alt=""
          className="tournament__logo"
          width={124}
          height={124}
        />
        <div>
          <div className="tournament__title">{tournament.ctx.name}</div>
          <div className="stack horizontal sm">
            {tournament.ranked ? (
              <div className="tournament__badge tournament__badge__ranked">
                Ranked
              </div>
            ) : (
              <div className="tournament__badge tournament__badge__unranked">
                Unranked
              </div>
            )}
            <div className="tournament__badge tournament__badge__modes">
              {tournament.modesIncluded.map((mode) => (
                <ModeImage key={mode} mode={mode} size={16} />
              ))}
            </div>
          </div>
          <div className="tournament__by mt-1">
            <Link
              to={userPage(tournament.ctx.author)}
              className="stack horizontal xs items-center text-lighter"
            >
              <UserIcon className="tournament__info__icon" />{" "}
              {tournament.ctx.author.username}
            </Link>
            <div className="stack horizontal xs items-center">
              <ClockIcon className="tournament__info__icon" />{" "}
              {isMounted
                ? tournament.ctx.startTime.toLocaleString(i18n.language, {
                    timeZoneName: "short",
                    minute: startsAtEvenHour ? undefined : "numeric",
                    hour: "numeric",
                    day: "numeric",
                    month: "long",
                  })
                : null}
            </div>
          </div>
        </div>
      </div>
      {showAvatarPendingApprovalText ? (
        <div className="text-warning text-sm font-semi-bold">
          Tournament logo pending moderator review. Will be shown automatically
          once approved.
        </div>
      ) : null}
      <TournamentRegisterInfoTabs />
    </div>
  );
}

function TournamentRegisterInfoTabs() {
  const user = useUser();
  const tournament = useTournament();
  const { t } = useTranslation(["tournament"]);

  const teamMemberOf = tournament.teamMemberOfByUser(user);
  const teamOwned = tournament.ownedTeamByUser(user);
  const isRegularMemberOfATeam = teamMemberOf && !teamOwned;

  const defaultTab = () => {
    if (tournament.hasStarted || !teamOwned) return 0;

    const registerTab = !tournament.ctx.rules ? 1 : 2;
    return registerTab;
  };
  const [tabIndex, setTabIndex] = useSearchParamState({
    defaultValue: defaultTab(),
    name: "tab",
    revive: Number,
  });

  const showAddIGNAlert =
    tournament.ctx.settings.requireInGameNames &&
    !teamOwned &&
    user &&
    !user?.inGameName;

  return (
    <div>
      <NewTabs
        sticky
        selectedIndex={tabIndex}
        setSelectedIndex={setTabIndex}
        tabs={[
          {
            label: "Description",
          },
          {
            label: "Rules",
            hidden: !tournament.ctx.rules,
          },
          {
            label: "Register",
            hidden: tournament.hasStarted,
          },
        ]}
        disappearing
        content={[
          {
            key: "description",
            element: (
              <div className="stack lg">
                {tournament.ctx.discordUrl ? (
                  <div className="w-max">
                    <LinkButton
                      to={tournament.ctx.discordUrl}
                      variant="outlined"
                      size="tiny"
                      isExternal
                      icon={<DiscordIcon />}
                    >
                      Join the Discord
                    </LinkButton>
                  </div>
                ) : null}

                <div className="tournament__info__description">
                  <Markdown options={{ wrapper: React.Fragment }}>
                    {tournament.ctx.description ?? ""}
                  </Markdown>
                </div>
                <TOPickedMapPoolInfo />
                <TiebreakerMapPoolInfo />
              </div>
            ),
          },
          {
            key: "rules",
            hidden: !tournament.ctx.rules,
            element: (
              <div className="tournament__info__description">
                <Markdown options={{ wrapper: React.Fragment }}>
                  {tournament.ctx.rules ?? ""}
                </Markdown>
              </div>
            ),
          },
          {
            key: "register",
            hidden: tournament.hasStarted,
            element: (
              <div className="stack lg">
                {isRegularMemberOfATeam ? (
                  <div className="stack md items-center">
                    <Alert>{t("tournament:pre.inATeam")}</Alert>
                    {teamMemberOf && teamMemberOf.checkIns.length === 0 ? (
                      <FormWithConfirm
                        dialogHeading={`Leave "${tournament.teamMemberOfByUser(user)?.name}"?`}
                        fields={[["_action", "LEAVE_TEAM"]]}
                        deleteButtonText="Leave"
                      >
                        <Button
                          className="build__small-text"
                          variant="minimal-destructive"
                          type="submit"
                        >
                          Leave the team
                        </Button>
                      </FormWithConfirm>
                    ) : null}
                  </div>
                ) : showAddIGNAlert ? (
                  <div>
                    <Alert variation="WARNING">
                      <div className="stack horizontal sm items-center flex-wrap justify-center text-center">
                        This tournament requires you to have an in-game name set{" "}
                        <LinkButton to={userEditProfilePage(user)} size="tiny">
                          Edit profile
                        </LinkButton>
                      </div>
                    </Alert>
                  </div>
                ) : (
                  <RegistrationForms />
                )}
                {user &&
                !tournament.teamMemberOfByUser(user) &&
                tournament.canAddNewSubPost &&
                !showAddIGNAlert &&
                !tournament.hasStarted ? (
                  <Link
                    to={tournamentSubsPage(tournament.ctx.id)}
                    className="text-xs text-center"
                  >
                    {t("tournament:pre.sub.prompt")}
                  </Link>
                ) : null}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

function PleaseLogIn() {
  const { t } = useTranslation(["tournament"]);

  return (
    <form className="stack items-center mt-4" action={LOG_IN_URL} method="post">
      <Button size="big" type="submit">
        {t("tournament:pre.logIn")}
      </Button>
    </form>
  );
}

function RegistrationForms() {
  const data = useLoaderData<TournamentRegisterPageLoader>();
  const user = useUser();
  const tournament = useTournament();

  const ownTeam = tournament.ownedTeamByUser(user);
  const ownTeamCheckedIn = Boolean(ownTeam && ownTeam.checkIns.length > 0);

  if (!user && !tournament.isInvitational) {
    return <PleaseLogIn />;
  }

  const showRegistrationProgress = () => {
    if (ownTeam) return true;

    return !tournament.isInvitational;
  };

  const showRegisterNewTeam = () => {
    if (ownTeam) return true;
    if (tournament.isInvitational) return false;
    if (!tournament.registrationOpen) return false;

    return !tournament.regularCheckInHasEnded;
  };

  return (
    <div className="stack lg">
      {showRegistrationProgress() ? (
        <RegistrationProgress
          checkedIn={ownTeamCheckedIn}
          name={ownTeam?.name}
          mapPool={data?.mapPool ?? undefined}
          members={ownTeam?.members}
        />
      ) : (
        <Alert>
          This tournament is invitational. Tournament organizer adds all teams.
        </Alert>
      )}
      {showRegisterNewTeam() ? (
        <>
          <FriendCode />
          {user?.friendCode ? (
            <TeamInfo
              ownTeam={ownTeam}
              canUnregister={Boolean(ownTeam && !ownTeamCheckedIn)}
            />
          ) : null}
        </>
      ) : null}
      {ownTeam ? (
        <>
          <FillRoster ownTeam={ownTeam} ownTeamCheckedIn={ownTeamCheckedIn} />
          {tournament.teamsPrePickMaps ? <CounterPickMapPoolPicker /> : null}
        </>
      ) : null}
    </div>
  );
}

function RegistrationProgress({
  checkedIn,
  name,
  members,
  mapPool,
}: {
  checkedIn?: boolean;
  name?: string;
  members?: unknown[];
  mapPool?: unknown[];
}) {
  const { i18n, t } = useTranslation(["tournament"]);
  const tournament = useTournament();
  const isMounted = useIsMounted();

  const steps = filterOutFalsy([
    {
      name: t("tournament:pre.steps.name"),
      completed: Boolean(name),
    },
    {
      name: t("tournament:pre.steps.roster"),
      completed:
        members && members.length >= TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL,
    },
    tournament.teamsPrePickMaps
      ? {
          name: t("tournament:pre.steps.pool"),
          completed: mapPool && mapPool.length > 0,
        }
      : null,
    {
      name: t("tournament:pre.steps.check-in"),
      completed: checkedIn,
    },
  ]);

  const regClosesBeforeStart =
    tournament.registrationClosesAt.getTime() !==
    tournament.ctx.startTime.getTime();

  const registrationClosesAtString = isMounted
    ? tournament.registrationClosesAt.toLocaleTimeString(i18n.language, {
        minute: "numeric",
        hour: "numeric",
        day: "2-digit",
        month: "2-digit",
      })
    : "";

  return (
    <div>
      <h3 className="tournament__section-header text-center">
        {t("tournament:pre.steps.header")}
      </h3>
      <section className="tournament__section stack md">
        <div className="stack horizontal lg justify-center text-sm font-semi-bold">
          {steps.map((step, i) => {
            return (
              <div
                key={step.name}
                className="stack sm items-center text-center"
              >
                {step.name}
                {step.completed ? (
                  <CheckmarkIcon
                    className="tournament__section__icon fill-success"
                    testId={`checkmark-icon-num-${i + 1}`}
                  />
                ) : (
                  <CrossIcon className="tournament__section__icon fill-error" />
                )}
              </div>
            );
          })}
        </div>
        <CheckIn
          canCheckIn={steps.filter((step) => !step.completed).length === 1}
          status={
            tournament.regularCheckInIsOpen
              ? "OPEN"
              : tournament.regularCheckInHasEnded
                ? "OVER"
                : "UPCOMING"
          }
          startDate={tournament.regularCheckInStartsAt}
          endDate={tournament.regularCheckInEndsAt}
          checkedIn={checkedIn}
        />
      </section>
      <div className="tournament__section__warning">
        {regClosesBeforeStart ? (
          <span className="text-warning">
            Registration closes at {registrationClosesAtString}
          </span>
        ) : (
          t("tournament:pre.footer")
        )}
      </div>
    </div>
  );
}

function CheckIn({
  status,
  canCheckIn,
  startDate,
  endDate,
  checkedIn,
}: {
  status: "OVER" | "OPEN" | "UPCOMING";
  canCheckIn: boolean;
  startDate: Date;
  endDate: Date;
  checkedIn?: boolean;
}) {
  const { t, i18n } = useTranslation(["tournament"]);
  const isMounted = useIsMounted();
  const fetcher = useFetcher();

  useAutoRerender();

  const checkInStartsString = isMounted
    ? startDate.toLocaleTimeString(i18n.language, {
        minute: "numeric",
        hour: "numeric",
        day: "2-digit",
        month: "2-digit",
      })
    : "";

  const checkInEndsString = isMounted
    ? endDate.toLocaleTimeString(i18n.language, {
        minute: "numeric",
        hour: "numeric",
        day: "2-digit",
        month: "2-digit",
      })
    : "";

  if (status === "UPCOMING") {
    return (
      <div className={clsx("text-center text-xs", { invisible: !isMounted })}>
        {t("tournament:pre.checkIn.range", {
          start: checkInStartsString,
          finish: checkInEndsString,
        })}
      </div>
    );
  }

  if (checkedIn) {
    return (
      <div className="text-center text-xs">
        {t("tournament:pre.checkIn.checkedIn")}
      </div>
    );
  }

  if (status === "OVER") {
    return (
      <div className="text-center text-xs">
        {t("tournament:pre.checkIn.over")}
      </div>
    );
  }

  if (!canCheckIn) {
    return (
      <div className="stack items-center">
        <Popover
          buttonChildren={<>{t("tournament:pre.checkIn.button")}</>}
          triggerClassName="tiny"
        >
          {t("tournament:pre.checkIn.cant")}
        </Popover>
      </div>
    );
  }

  return (
    <fetcher.Form method="post" className="stack items-center">
      <SubmitButton
        size="tiny"
        _action="CHECK_IN"
        state={fetcher.state}
        testId="check-in-button"
      >
        {t("tournament:pre.checkIn.button")}
      </SubmitButton>
    </fetcher.Form>
  );
}

function TeamInfo({
  ownTeam,
  canUnregister,
}: {
  ownTeam?: TournamentDataTeam | null;
  canUnregister: boolean;
}) {
  const data = useLoaderData<TournamentRegisterPageLoader>();
  const { t } = useTranslation(["tournament", "common"]);
  const fetcher = useFetcher();
  const tournament = useTournament();
  const [teamName, setTeamName] = React.useState(ownTeam?.name ?? "");
  const user = useUser();
  const ref = React.useRef<HTMLFormElement>(null);
  const [signUpWithTeam, setSignUpWithTeam] = React.useState(() =>
    Boolean(tournament.ownedTeamByUser(user)?.team),
  );
  // xxx: initial state
  const [uploadedAvatar, setUploadedAvatar] = React.useState<File | null>(null);

  const handleSignUpWithTeamChange = (checked: boolean) => {
    if (!checked) {
      setSignUpWithTeam(false);
    } else if (data?.team) {
      setSignUpWithTeam(true);
      setTeamName(data.team.name);
    }
  };

  const handleSubmit = () => {
    const formData = new FormData(ref.current!);

    if (uploadedAvatar) {
      // replace with the compressed version
      formData.delete("img");
      formData.append("img", uploadedAvatar, uploadedAvatar.name);
    }

    fetcher.submit(formData, {
      encType: uploadedAvatar ? "multipart/form-data" : undefined,
      method: "post",
    });
  };

  const submitButtonDisabled = () => {
    if (fetcher.state !== "idle") return true;

    return false;
  };

  const avatarUrl = (() => {
    if (signUpWithTeam) {
      if (ownTeam?.team?.logoUrl) {
        return userSubmittedImage(ownTeam.team.logoUrl);
      }
      return data?.team?.logoUrl ? userSubmittedImage(data.team.logoUrl) : null;
    }
    if (uploadedAvatar) return URL.createObjectURL(uploadedAvatar);
    if (ownTeam?.pickupAvatarUrl) {
      return userSubmittedImage(ownTeam.pickupAvatarUrl);
    }

    return null;
  })();

  const canEditAvatar =
    tournament.registrationOpen &&
    !signUpWithTeam &&
    uploadedAvatar &&
    !ownTeam?.pickupAvatarUrl;

  const canDeleteAvatar = ownTeam?.pickupAvatarUrl;

  return (
    <div>
      <div className="stack horizontal justify-between">
        <h3 className="tournament__section-header">
          2. {t("tournament:pre.info.header")}
        </h3>
        {canUnregister ? (
          <FormWithConfirm
            dialogHeading={t("tournament:pre.info.unregister.confirm")}
            deleteButtonText={t("tournament:pre.info.unregister")}
            fields={[["_action", "UNREGISTER"]]}
          >
            <Button
              className="build__small-text"
              variant="minimal-destructive"
              size="tiny"
              type="submit"
            >
              {t("tournament:pre.info.unregister")}
            </Button>
          </FormWithConfirm>
        ) : null}
      </div>
      <section className="tournament__section">
        <Form method="post" className="stack md items-center" ref={ref}>
          <input type="hidden" name="_action" value="UPSERT_TEAM" />
          {signUpWithTeam && data?.team ? (
            <input type="hidden" name="teamId" value={data.team.id} />
          ) : null}
          <div className="stack sm items-center">
            {data?.team && tournament.registrationOpen ? (
              <div className="tournament__section__input-container">
                <Label htmlFor="signUpAsTeam">
                  Sign up as {data.team.name}
                </Label>
                <Toggle
                  id="signUpAsTeam"
                  checked={signUpWithTeam}
                  setChecked={handleSignUpWithTeamChange}
                />
              </div>
            ) : null}

            <div className="tournament__section__input-container">
              <Label htmlFor="teamName">{t("tournament:pre.steps.name")}</Label>
              <Input
                name="teamName"
                id="teamName"
                required
                maxLength={TOURNAMENT.TEAM_NAME_MAX_LENGTH}
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                readOnly={!tournament.registrationOpen || signUpWithTeam}
              />
            </div>
            {tournament.registrationOpen || avatarUrl ? (
              <div className="tournament__section__input-container">
                <Label htmlFor="logo">Logo</Label>
                {avatarUrl ? (
                  <div className="stack horizontal md items-center">
                    <Avatar size="xsm" url={avatarUrl} />
                    {canEditAvatar ? (
                      <Button
                        variant="minimal"
                        size="tiny"
                        onClick={() => setUploadedAvatar(null)}
                      >
                        {t("common:actions.edit")}
                      </Button>
                    ) : null}
                    {canDeleteAvatar ? (
                      <FormWithConfirm
                        dialogHeading="Delete team logo?"
                        fields={[["_action", "DELETE_LOGO"]]}
                      >
                        <Button
                          variant="minimal-destructive"
                          size="tiny"
                          type="submit"
                        >
                          <TrashIcon className="small-icon" />
                        </Button>
                      </FormWithConfirm>
                    ) : null}
                  </div>
                ) : (
                  <TournamentLogoUpload onChange={setUploadedAvatar} />
                )}
              </div>
            ) : null}
            <div className="stack sm">
              <div className="text-lighter text-sm stack horizontal sm items-center">
                <input
                  id="no-host"
                  type="checkbox"
                  name="prefersNotToHost"
                  defaultChecked={Boolean(ownTeam?.prefersNotToHost)}
                />
                <label htmlFor="no-host" className="mb-0">
                  {t("tournament:pre.info.noHost")}
                </label>
              </div>

              {tournament.ctx.settings.enableNoScreenToggle ? (
                <div className="text-lighter text-sm stack horizontal sm items-center">
                  <input
                    id="no-screen"
                    type="checkbox"
                    name="noScreen"
                    defaultChecked={Boolean(ownTeam?.noScreen)}
                    data-testid="no-screen-checkbox"
                  />
                  <label htmlFor="no-screen" className="mb-0">
                    {t("tournament:pre.info.noScreen")}
                  </label>
                </div>
              ) : null}
            </div>
          </div>
          {/* why jumps on SSR? */}
          <Button
            testId="save-team-button"
            disabled={submitButtonDisabled()}
            onClick={handleSubmit}
          >
            {t("common:actions.save")}
          </Button>
        </Form>
      </section>
    </div>
  );
}

const logoDimensions = imgTypeToDimensions["team-pfp"];
function TournamentLogoUpload({
  onChange,
}: {
  onChange: (file: File | null) => void;
}) {
  return (
    <input
      id="img-field"
      className="plain"
      type="file"
      name="img"
      accept="image/png, image/jpeg, image/webp"
      onChange={(e) => {
        const uploadedFile = e.target.files?.[0];
        if (!uploadedFile) {
          onChange(null);
          return;
        }

        new Compressor(uploadedFile, {
          height: logoDimensions.height,
          width: logoDimensions.width,
          maxHeight: logoDimensions.height,
          maxWidth: logoDimensions.width,
          // 0.5MB
          convertSize: 500_000,
          resize: "cover",
          success(result) {
            const file = new File([result], `img.webp`, {
              type: "image/webp",
            });
            onChange(file);
          },
          error(err) {
            console.error(err.message);
          },
        });
      }}
    />
  );
}

function FriendCode() {
  const user = useUser();

  return (
    <div>
      <h3 className="tournament__section-header">1. Friend code</h3>
      <section className="tournament__section">
        <div className="tournament__section__input-container mx-auto">
          <FriendCodeInput friendCode={user?.friendCode} />
        </div>
      </section>
      {user?.friendCode ? (
        <div className="tournament__section__warning">
          Is the friend code above wrong? Contact Sendou directly to change it.
        </div>
      ) : null}
    </div>
  );
}

function FillRoster({
  ownTeam,
  ownTeamCheckedIn,
}: {
  ownTeam: TournamentDataTeam;
  ownTeamCheckedIn: boolean;
}) {
  const data = useLoaderData<TournamentRegisterPageLoader>();
  const user = useUser();
  const tournament = useTournament();
  const [, copyToClipboard] = useCopyToClipboard();
  const { t } = useTranslation(["common", "tournament"]);

  const inviteLink = `${SENDOU_INK_BASE_URL}${tournamentJoinPage({
    tournamentId: tournament.ctx.id,
    inviteCode: ownTeam.inviteCode!,
  })}`;

  const { members: ownTeamMembers } = tournament.ownedTeamByUser(user) ?? {};
  invariant(ownTeamMembers, "own team members should exist");

  const missingMembers = Math.max(
    TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL - ownTeamMembers.length,
    0,
  );

  const optionalMembers = Math.max(
    tournament.maxTeamMemberCount - ownTeamMembers.length - missingMembers,
    0,
  );

  const showDeleteMemberSection =
    (!ownTeamCheckedIn && ownTeamMembers.length > 1) ||
    (ownTeamCheckedIn &&
      ownTeamMembers.length > TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL);

  const playersAvailableToDirectlyAdd = (() => {
    return (data!.trusterPlayers ?? []).filter((user) => {
      const isNotInTeam = tournament.ctx.teams.every((team) =>
        team.members.every((member) => member.userId !== user.id),
      );

      const hasInGameNameIfNeeded =
        !tournament.ctx.settings.requireInGameNames || user.inGameName;

      return isNotInTeam && hasInGameNameIfNeeded;
    });
  })();

  const teamIsFull = ownTeamMembers.length >= tournament.maxTeamMemberCount;
  const canAddMembers = !teamIsFull && tournament.registrationOpen;

  return (
    <div>
      <h3 className="tournament__section-header">
        3. {t("tournament:pre.roster.header")}
      </h3>
      <section className="tournament__section stack lg items-center">
        {playersAvailableToDirectlyAdd.length > 0 && canAddMembers ? (
          <>
            <DirectlyAddPlayerSelect players={playersAvailableToDirectlyAdd} />
            <Divider className="text-uppercase">{t("common:or")}</Divider>
          </>
        ) : null}
        {canAddMembers ? (
          <div className="stack md items-center">
            <div className="text-center text-sm">
              {t("tournament:actions.shareLink", { inviteLink })}
            </div>
            <div>
              <Button
                size="tiny"
                onClick={() => copyToClipboard(inviteLink)}
                variant="outlined"
              >
                {t("common:actions.copyToClipboard")}
              </Button>
            </div>
          </div>
        ) : null}
        <div className="stack lg horizontal mt-2 flex-wrap justify-center">
          {ownTeamMembers.map((member, i) => {
            return (
              <div
                key={member.userId}
                className="stack sm items-center text-sm"
                data-testid={`member-num-${i + 1}`}
              >
                <Avatar size="xsm" user={member} />
                {tournament.ctx.settings.requireInGameNames ? (
                  <div>
                    <div className="text-center">
                      {member.inGameName ?? member.username}
                    </div>
                    {member.inGameName ? (
                      <div className="text-lighter text-xs font-bold text-center">
                        {member.username}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  member.username
                )}
              </div>
            );
          })}
          {new Array(missingMembers).fill(null).map((_, i) => {
            return (
              <div key={i} className="tournament__missing-player">
                ?
              </div>
            );
          })}
          {new Array(optionalMembers).fill(null).map((_, i) => {
            return (
              <div
                key={i}
                className="tournament__missing-player tournament__missing-player__optional"
              >
                ?
              </div>
            );
          })}
        </div>
        {showDeleteMemberSection ? (
          <DeleteMember members={ownTeamMembers} />
        ) : null}
      </section>
      {tournament.ctx.settings.requireInGameNames ? (
        <div className="tournament__section__warning text-warning-important">
          Note that you are expected to use the in-game names as listed above.
          Playing in the event with a different name or using the alias feature
          might result in disqualification.
        </div>
      ) : (
        <div className="tournament__section__warning">
          {t("tournament:pre.roster.footer", {
            atLeastCount: TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL,
            maxCount: tournament.maxTeamMemberCount,
          })}
        </div>
      )}
    </div>
  );
}

function DirectlyAddPlayerSelect({
  players,
}: {
  players: { id: number; username: string }[];
}) {
  const { t } = useTranslation(["tournament", "common"]);
  const fetcher = useFetcher();
  const id = React.useId();

  return (
    <fetcher.Form method="post" className="stack horizontal sm items-end">
      <div>
        <Label htmlFor={id}>
          {t("tournament:pre.roster.addTrusted.header")}
        </Label>
        <select id={id} name="userId">
          {players.map((player) => {
            return (
              <option key={player.id} value={player.id}>
                {player.username}
              </option>
            );
          })}
        </select>
      </div>
      <SubmitButton
        _action="ADD_PLAYER"
        state={fetcher.state}
        testId="add-player-button"
      >
        {t("common:actions.add")}
      </SubmitButton>
    </fetcher.Form>
  );
}

function DeleteMember({ members }: { members: TournamentDataTeam["members"] }) {
  const { t } = useTranslation(["tournament", "common"]);
  const id = React.useId();
  const fetcher = useFetcher();
  const [expanded, setExpanded] = React.useState(false);

  if (!expanded) {
    return (
      <Button
        size="tiny"
        variant="minimal-destructive"
        onClick={() => setExpanded(true)}
      >
        {t("tournament:pre.roster.delete.button")}
      </Button>
    );
  }

  return (
    <fetcher.Form method="post">
      <Label htmlFor={id}>{t("tournament:pre.roster.delete.header")}</Label>
      <div className="stack md horizontal">
        <select name="userId" id={id}>
          {members
            .filter((member) => !member.isOwner)
            .map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.username}
              </option>
            ))}
        </select>
        <SubmitButton
          state={fetcher.state}
          _action="DELETE_TEAM_MEMBER"
          variant="minimal-destructive"
        >
          {t("common:actions.delete")}
        </SubmitButton>
      </div>
    </fetcher.Form>
  );
}

// TODO: useBlocker to prevent leaving page if made changes without saving
function CounterPickMapPoolPicker() {
  const { t } = useTranslation(["common", "game-misc", "tournament"]);
  const tournament = useTournament();
  const fetcher = useFetcher();
  const data = useLoaderData<TournamentRegisterPageLoader>();
  const [counterPickMaps, setCounterPickMaps] = React.useState(
    data?.mapPool ?? [],
  );

  const counterPickMapPool = new MapPool(counterPickMaps);

  const isOneModeTournamentOf =
    tournament.modesIncluded.length === 1 ? tournament.modesIncluded[0] : null;

  return (
    <div>
      <h3 className="tournament__section-header">
        4. {t("tournament:pre.pool.header")}
      </h3>
      <section className="tournament__section">
        <fetcher.Form method="post" className="stack lg">
          <input
            type="hidden"
            name="mapPool"
            value={JSON.stringify(counterPickMaps)}
          />
          {rankedModesShort
            .filter(
              (mode) =>
                !isOneModeTournamentOf || isOneModeTournamentOf === mode,
            )
            .map((mode) => {
              return (
                <ModeMapPoolPicker
                  key={mode}
                  amountToPick={
                    isOneModeTournamentOf
                      ? TOURNAMENT.COUNTERPICK_ONE_MODE_TOURNAMENT_MAPS_PER_MODE
                      : TOURNAMENT.COUNTERPICK_MAPS_PER_MODE
                  }
                  mode={mode}
                  tiebreaker={
                    tournament.ctx.tieBreakerMapPool.find(
                      (stage) => stage.mode === mode,
                    )?.stageId
                  }
                  pool={
                    counterPickMaps
                      .filter((m) => m.mode === mode)
                      .map((m) => m.stageId) ?? []
                  }
                  onChange={(stageIds) =>
                    setCounterPickMaps([
                      ...counterPickMaps.filter((m) => m.mode !== mode),
                      ...stageIds.map((stageId) => ({ mode, stageId })),
                    ])
                  }
                />
              );
            })}
          {validateCounterPickMapPool(
            counterPickMapPool,
            isOneModeTournamentOf,
            tournament.ctx.tieBreakerMapPool,
          ) === "VALID" ? (
            <SubmitButton
              _action="UPDATE_MAP_POOL"
              state={fetcher.state}
              className="self-center mt-4"
              testId="save-map-list-button"
            >
              {t("common:actions.save")}
            </SubmitButton>
          ) : (
            <MapPoolValidationStatusMessage
              status={validateCounterPickMapPool(
                counterPickMapPool,
                isOneModeTournamentOf,
                tournament.ctx.tieBreakerMapPool,
              )}
            />
          )}
        </fetcher.Form>
      </section>
    </div>
  );
}

function MapPoolValidationStatusMessage({
  status,
}: {
  status: CounterPickValidationStatus;
}) {
  const { t } = useTranslation(["common"]);

  if (
    status !== "TOO_MUCH_STAGE_REPEAT" &&
    status !== "STAGE_REPEAT_IN_SAME_MODE" &&
    status !== "INCLUDES_BANNED" &&
    status !== "INCLUDES_TIEBREAKER"
  )
    return null;

  return (
    <div className="mt-4">
      <Alert alertClassName="w-max" variation="WARNING" tiny>
        {t(`common:maps.validation.${status}`, {
          maxStageRepeat: TOURNAMENT.COUNTERPICK_MAX_STAGE_REPEAT,
        })}
      </Alert>
    </div>
  );
}

function TOPickedMapPoolInfo() {
  const { t } = useTranslation(["calendar"]);
  const tournament = useTournament();

  if (tournament.ctx.toSetMapPool.length === 0) return null;

  return (
    <Section title={t("calendar:forms.mapPool")}>
      <div className="event__map-pool-section">
        <MapPoolStages mapPool={new MapPool(tournament.ctx.toSetMapPool)} />
        <LinkButton
          className="event__create-map-list-link"
          to={readonlyMapsPage(tournament.ctx.eventId)}
          variant="outlined"
          size="tiny"
        >
          <Image alt="" path={navIconUrl("maps")} width={22} height={22} />
          {t("calendar:createMapList")}
        </LinkButton>
      </div>
    </Section>
  );
}

function TiebreakerMapPoolInfo() {
  const { t } = useTranslation(["game-misc"]);
  const tournament = useTournament();

  if (tournament.ctx.tieBreakerMapPool.length === 0) return null;

  return (
    <div className="text-sm text-lighter text-semi-bold">
      Tiebreaker map pool:{" "}
      {tournament.ctx.tieBreakerMapPool
        .sort((a, b) => modesShort.indexOf(a.mode) - modesShort.indexOf(b.mode))
        .map(
          (map) =>
            `${t(`game-misc:MODE_SHORT_${map.mode}`)} ${t(`game-misc:STAGE_${map.stageId}`)}`,
        )
        .join(", ")}
    </div>
  );
}
