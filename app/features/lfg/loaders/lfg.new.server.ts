import type { LoaderFunctionArgs } from "@remix-run/node";
import { requireUserId } from "~/features/auth/core/user.server";
import * as UserRepository from "~/features/user-page/UserRepository.server";
import * as QSettingsRepository from "~/features/sendouq-settings/QSettingsRepository.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUserId(request);

  const userProfileData = await UserRepository.findByIdentifier(
    String(user.id),
  );
  const userQSettingsData = await QSettingsRepository.settingsByUserId(user.id);

  return {
    team: userProfileData?.team,
    weaponPool: userProfileData?.weapons,
    languages: userQSettingsData.languages,
  };
};
