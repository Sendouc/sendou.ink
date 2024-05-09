import { z } from "zod";
import { LFG, TIMEZONES } from "../lfg-constants";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { requireUser } from "~/features/auth/core/user.server";
import { parseRequestFormData } from "~/utils/remix";
import { LFG_PAGE } from "~/utils/urls";
import * as LFGRepository from "../LFGRepository.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request);
  const data = await parseRequestFormData({
    request,
    schema,
  });

  // xxx: teamId here if needed + validate

  await LFGRepository.insertPost({
    text: data.postText,
    timezone: data.timezone,
    type: data.type,
    teamId: null,
    authorId: user.id,
  });

  return redirect(LFG_PAGE);
};

const schema = z.object({
  type: z.enum(LFG.types),
  postText: z.string().min(LFG.MIN_TEXT_LENGTH).max(LFG.MAX_TEXT_LENGTH),
  timezone: z.string().refine((val) => TIMEZONES.includes(val)),
});
