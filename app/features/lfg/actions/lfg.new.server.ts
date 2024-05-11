import { z } from "zod";
import { INDIVIDUAL_POST_TYPES, LFG, TIMEZONES } from "../lfg-constants";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { requireUser } from "~/features/auth/core/user.server";
import { parseRequestFormData, validate } from "~/utils/remix";
import { LFG_PAGE } from "~/utils/urls";
import * as LFGRepository from "../LFGRepository.server";
import * as UserRepository from "~/features/user-page/UserRepository.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request);
  const data = await parseRequestFormData({
    request,
    schema,
  });

  const identifier = String(user.id);
  const { team } = (await UserRepository.findByIdentifier(identifier)) ?? {};

  validate(
    INDIVIDUAL_POST_TYPES.includes(data.type) || team,
    "Team needs to be set for this type of post",
  );

  await LFGRepository.insertPost({
    text: data.postText,
    timezone: data.timezone,
    type: data.type,
    teamId: team?.id,
    authorId: user.id,
  });

  return redirect(LFG_PAGE);
};

const schema = z.object({
  type: z.enum(LFG.types),
  postText: z.string().min(LFG.MIN_TEXT_LENGTH).max(LFG.MAX_TEXT_LENGTH),
  timezone: z.string().refine((val) => TIMEZONES.includes(val)),
});
