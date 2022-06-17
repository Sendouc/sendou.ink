import { questionCommand } from "./q";
import { lfgRoleCommand } from "./lfg";

export const commands = [questionCommand, lfgRoleCommand];

export const commandsMap = Object.fromEntries(commands.map((c) => [c.name, c]));
