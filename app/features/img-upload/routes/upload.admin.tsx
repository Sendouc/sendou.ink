import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { Main } from "~/components/Main";
import { SubmitButton } from "~/components/SubmitButton";
import { requireUserId } from "~/features/auth/core/user.server";
import { isMod } from "~/permissions";
import { notFoundIfFalsy, parseRequestFormData, validate } from "~/utils/remix";
import { userSubmittedImage } from "~/utils/urls";
import { countAllUnvalidatedImg } from "../queries/countAllUnvalidatedImg.server";
import { oneUnvalidatedImage } from "../queries/oneUnvalidatedImage";
import { validateImage } from "../queries/validateImage";
import { validateImageSchema } from "../upload-schemas.server";

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUserId(request);
  const data = await parseRequestFormData({
    schema: validateImageSchema,
    request,
  });

  validate(isMod(user), "Only admins can validate images");

  validateImage(data.imageId);

  return null;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUserId(request);

  notFoundIfFalsy(isMod(user));

  return {
    image: oneUnvalidatedImage(),
    unvalidatedImgCount: countAllUnvalidatedImg(),
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
      <div>{data.unvalidatedImgCount} left</div>
      <img src={userSubmittedImage(data.image.url)} alt="" />
      <Form method="post">
        <input type="hidden" name="imageId" value={data.image.id} />
        <SubmitButton>Ok</SubmitButton>
      </Form>
      <div>From: {data.image.submitterUserId}</div>
    </>
  );
}
