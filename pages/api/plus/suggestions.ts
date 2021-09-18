import { NextApiRequest, NextApiResponse } from "next";
import { createHandler, getMySession } from "utils/api";
import plusService, { Suggestions } from "services/plus";
import { Serialized } from "utils/types";
import { suggestionFullSchema } from "utils/validators/suggestion";

export type SuggestionsGet = Serialized<Suggestions>;

const GET = async (_req: NextApiRequest, res: NextApiResponse<Suggestions>) => {
  const suggestions = await plusService.getSuggestions();
  res.status(200).json(suggestions);
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getMySession(req);
  if (!user) {
    return res.status(401).end();
  }

  const parsed = suggestionFullSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(parsed.error);
  }

  await plusService.addSuggestion({
    input: parsed.data,
    userId: user.id,
  });

  res.status(200).end();
};

const suggestionsHandler = (req: NextApiRequest, res: NextApiResponse) =>
  createHandler(req, res, { GET, POST });

export default suggestionsHandler;
