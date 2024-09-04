import { userDiscordIdIsAged } from "~/utils/users";

export const canAddNewEvent = (user: { discordId: string }) =>
	userDiscordIdIsAged(user);
