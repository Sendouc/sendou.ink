import { Embed } from "./embed";

export type InvocationCommon = {
  member: {
    user: {
      id: number;
      username: string;
      avatar: string;
      discriminator: string;
      public_flags: number;
    };
    roles: string[];
  };
};

export type InfoCommandInteraction = {
  data: { name: "info"; options: [{ name: "user"; value: number }] | [] };
};

export type InteractionInfo =
  | {
      data: { name: "ping" };
    }
  | InfoCommandInteraction;

export type RespondData = {
  content?: string;
  embeds?: Embed[];
};
