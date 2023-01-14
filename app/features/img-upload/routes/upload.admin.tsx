import type { ActionFunction, LoaderArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { Main } from "~/components/Main";
import { SubmitButton } from "~/components/SubmitButton";
import { requireUserId } from "~/modules/auth/user.server";
import { isAdmin } from "~/permissions";
import { notFoundIfFalsy, parseRequestFormData, validate } from "~/utils/remix";
import { userSubmittedImage } from "~/utils/urls";
import { oneUnvalidatedImage } from "../queries/oneUnvalidatedImage";
import { validateImage } from "../queries/validateImage";
import { validateImageSchema } from "../upload-schemas.server";

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUserId(request);
  const data = await parseRequestFormData({
    schema: validateImageSchema,
    request,
  });

  validate(isAdmin(user));

  validateImage(data.imageId);

  return null;
};

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUserId(request);

  notFoundIfFalsy(isAdmin(user));

  return {
    image: oneUnvalidatedImage(),
  };
};

export default function ImageUploadAdminPage() {
  return (
    <Main>
      <ImageValidator />
    </Main>
  );
}

function ImageValidator() {
  const data = useLoaderData<typeof loader>();

  if (!data.image) {
    return <>All validated!</>;
  }

  return (
    <>
      <img src={userSubmittedImage(data.image.url)} alt="" />
      <Form method="post">
        <input type="hidden" name="imageId" value={data.image.id} />
        <SubmitButton>Ok</SubmitButton>
      </Form>
      <div>From: {data.image.submitterUserId}</div>
    </>
  );
}
