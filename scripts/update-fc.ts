/* eslint-disable no-console */
import "dotenv/config";
import { invariant } from "~/utils/invariant";
import { ADMIN_ID } from "~/constants";
import { FRIEND_CODE_REGEXP } from "~/features/sendouq/q-constants";
import * as UserRepository from "~/features/user-page/UserRepository.server";

async function main() {
  const discordId = process.argv[2]?.trim();

  invariant(discordId, "discord id is required (argument 1)");

  const newFriendCode = process.argv[3]?.trim();

  invariant(discordId, "friend code is required (argument 2)");

  invariant(FRIEND_CODE_REGEXP.test(newFriendCode), "Invalid friend code");

  await UserRepository.insertFriendCode({
    friendCode: newFriendCode,
    submitterUserId: ADMIN_ID,
    userId: await UserRepository.findByIdentifier(discordId).then((u) => u!.id),
  });
  console.log(`Friend code updated: ${discordId} - ${newFriendCode}`);
}

void main();
