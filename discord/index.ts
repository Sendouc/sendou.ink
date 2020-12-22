import {
  InteractionResponseFlags,
  InteractionResponseType,
} from "discord-interactions";

type InvocationCommon = {
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

interface Interaction extends InvocationCommon {
  data: { name: "ping" };
}

type ReturnData = {
  type: InteractionResponseType;
  data: {
    content: string;
  };
  flags?: InteractionResponseFlags;
};

const handleCommand = (interaction: Interaction): ReturnData => {
  switch (interaction.data.name) {
    case "ping":
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE,
        data: {
          content: "pong",
        },
      };
    default:
      console.error("not existing command invoced");
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE,
        data: {
          content: "Sorry but I don't understand this command 😞",
        },
        flags: InteractionResponseFlags.EPHEMERAL,
      };
  }
};

export default handleCommand;
