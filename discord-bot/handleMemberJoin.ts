import { GuildMember } from "discord.js";
import { givePlusRoleToMember } from "./commands/access";
import ids from "./ids";

export async function handleMemberJoin(member: GuildMember) {
  if (member.guild.id !== ids.guilds.plusServer) return;

  await givePlusRoleToMember({ member });
}
