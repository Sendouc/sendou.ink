import infoCommand from "./commands/info";
import { InteractionInfo, InvocationCommon, RespondData } from "./utils";

const handleCommand = async (
  interaction: InvocationCommon & InteractionInfo,
  respond: (result: RespondData) => void
) => {
  switch (interaction.data.name) {
    case "ping":
      respond({ content: "pong" });
      break;
    case "info":
      const discordId = "" + interaction.data.options[0].value;
      await infoCommand(respond, discordId);
      break;
    default:
      console.error("not existing command invoced");
      respond({
        content:
          "Sorry but I don't understand this command 😞... Contact my maker Sendou#4059 to get it fixed",
      });
  }
};

export default handleCommand;
