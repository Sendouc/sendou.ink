import { questionCommand } from "./q";

export const commands = [questionCommand];

export const commandsMap = Object.fromEntries(commands.map((c) => [c.name, c]));
