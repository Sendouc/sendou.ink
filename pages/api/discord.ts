import { NextApiRequest, NextApiResponse } from "next";
import getRawBody from "raw-body";
import nacl from "tweetnacl";

/*
{
    "type": 2,
    "token": "A_UNIQUE_TOKEN",
    "member": { 
        "user": {
            "id": 53908232506183680,
            "username": "Mason",
            "avatar": "a_d5efa99b3eeaa7dd43acca82f5692432",
            "discriminator": "1337",
            "public_flags": 131141
        },
        "roles": ["539082325061836999"],
        "premium_since": null,
        "permissions": "2147483647",
        "pending": false,
        "nick": null,
        "mute": false,
        "joined_at": "2017-03-13T19:19:14.040000+00:00",
        "is_pending": false,
        "deaf": false 
    },
    "id": "786008729715212338",
    "guild_id": "290926798626357999",
    "data": { 
        "options": [{
            "name": "cardname",
            "value": "The Gitrog Monster"
        }],
        "name": "cardsearch",
        "id": "771825006014889984" 
    },
    "channel_id": "645027906669510667" 
}
 */

const discordCommandHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const PUBLIC_KEY =
    "90bc7521c9602f53db2c93c6a00a68d71a4dbb703f8dc91ef66eb2462ad63d93";

  const signature = req.headers["x-signature-ed25519"] as string;
  const timestamp = req.headers["x-signature-timestamp"] as string;
  const body = (await getRawBody(req)).toString(); // rawBody is expected to be a string, not raw bytes

  let isVerified;

  try {
    isVerified = nacl.sign.detached.verify(
      Buffer.from(timestamp + body),
      Buffer.from(signature, "hex"),
      Buffer.from(PUBLIC_KEY, "hex")
    );
  } catch {
    return res.status(401).end("invalid request signature");
  }

  if (!isVerified) {
    return res.status(401).end("invalid request signature");
  }

  // if req.json type === 1
  res.status(200).json({
    type: 1,
  });
};

export default discordCommandHandler;

export const config = {
  api: {
    bodyParser: false,
  },
};
