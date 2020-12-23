import handleCommand from "discord";
import {
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
} from "discord-interactions";
import { RespondData } from "discord/utils";
import { NextApiRequest, NextApiResponse } from "next";
import getRawBody from "raw-body";
import nacl from "tweetnacl";

const discordCommandHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const PUBLIC_KEY =
    "90bc7521c9602f53db2c93c6a00a68d71a4dbb703f8dc91ef66eb2462ad63d93";
  const rawBody = (await getRawBody(req)).toString();

  if (process.env.NODE_ENV === "production") {
    const signature = req.headers["x-signature-ed25519"] as string;
    const timestamp = req.headers["x-signature-timestamp"] as string;

    let isVerified;

    try {
      isVerified = nacl.sign.detached.verify(
        Buffer.from(timestamp + rawBody),
        Buffer.from(signature, "hex"),
        Buffer.from(PUBLIC_KEY, "hex")
      );
    } catch {
      return res.status(401).end("invalid request signature");
    }

    if (!isVerified) {
      return res.status(401).end("invalid request signature");
    }
  }

  const interaction = JSON.parse(rawBody);

  if (interaction && interaction.type === InteractionType.COMMAND) {
    handleCommand(interaction, (data, isEpheremal) =>
      res.status(200).json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: getCompleteData(data),
        flags: isEpheremal ? InteractionResponseFlags.EPHEMERAL : undefined,
      })
    );
  } else {
    res.status(200).json({
      type: 1,
    });
  }
};

function getCompleteData(result: RespondData) {
  return {
    ...result,
    // add zero-width space because empty content isn't allowed even with embeds
    content: result.content ? result.content : "\u200b",
  };
}

export default discordCommandHandler;

export const config = {
  api: {
    bodyParser: false,
  },
};
