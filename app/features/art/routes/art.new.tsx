import type { ActionFunction, LoaderArgs } from "@remix-run/node";
import {
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  unstable_parseMultipartFormData as parseMultipartFormData,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import Compressor from "compressorjs";
import clone from "just-clone";
import { nanoid } from "nanoid";
import * as React from "react";
import { useFetcher } from "react-router-dom";
import invariant from "tiny-invariant";
import { Button } from "~/components/Button";
import { UserCombobox } from "~/components/Combobox";
import { FormMessage } from "~/components/FormMessage";
import { Label } from "~/components/Label";
import { Main } from "~/components/Main";
import { Toggle } from "~/components/Toggle";
import { CrossIcon } from "~/components/icons/Cross";
import { s3UploadHandler } from "~/features/img-upload";
import { useTranslation } from "~/hooks/useTranslation";
import { requireUser } from "~/modules/auth";
import { dateToDatabaseTimestamp } from "~/utils/dates";
import {
  validate,
  type SendouRouteHandle,
  parseFormData,
  parseRequestFormData,
} from "~/utils/remix";
import {
  ART_PAGE,
  conditionalUserSubmittedImage,
  navIconUrl,
  userArtPage,
} from "~/utils/urls";
import { ART, NEW_ART_EXISTING_SEARCH_PARAM_KEY } from "../art-constants";
import { editArtSchema, newArtSchema } from "../art-schemas.server";
import { addNewArt, editArt } from "../queries/addNewArt.server";
import { findArtById } from "../queries/findArtById.server";
import { previewUrl } from "../art-utils";

export const handle: SendouRouteHandle = {
  i18n: ["art"],
  breadcrumb: () => ({
    imgPath: navIconUrl("art"),
    href: ART_PAGE,
    type: "IMAGE",
  }),
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);

  const searchParams = new URL(request.url).searchParams;
  const artIdRaw = searchParams.get(NEW_ART_EXISTING_SEARCH_PARAM_KEY);

  // updating logic
  if (artIdRaw) {
    const artId = Number(artIdRaw);

    const existingArt = findArtById(artId);
    validate(
      existingArt?.authorId === user.id,
      "Insufficient permissions",
      401
    );

    const data = await parseRequestFormData({
      request,
      schema: editArtSchema,
    });

    editArt({
      authorId: user.id,
      artId,
      description: data.description,
      isShowcase: data.isShowcase,
      linkedUsers: data.linkedUsers,
    });
  } else {
    const uploadHandler = composeUploadHandlers(
      s3UploadHandler(`art-${nanoid()}-${Date.now()}`),
      createMemoryUploadHandler()
    );
    const formData = await parseMultipartFormData(request, uploadHandler);
    const imgSrc = formData.get("img") as string | null;
    invariant(imgSrc);

    const urlParts = imgSrc.split("/");
    const fileName = urlParts[urlParts.length - 1];
    invariant(fileName);

    const data = parseFormData({
      formData,
      schema: newArtSchema,
    });

    addNewArt({
      authorId: user.id,
      description: data.description,
      url: fileName,
      validatedAt: user.patronTier ? dateToDatabaseTimestamp(new Date()) : null,
      linkedUsers: data.linkedUsers,
    });
  }

  return redirect(userArtPage(user));
};

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request);

  validate(user.isArtist, "No artist role", 401);

  const artIdRaw = new URL(request.url).searchParams.get(
    NEW_ART_EXISTING_SEARCH_PARAM_KEY
  );
  if (!artIdRaw) return null;
  const artId = Number(artIdRaw);

  const art = findArtById(artId);
  if (!art || art.authorId !== user.id) return null;

  return { art };
};

export default function NewArtPage() {
  const data = useLoaderData<typeof loader>();
  const [img, setImg] = React.useState<File | null>(null);
  const [smallImg, setSmallImg] = React.useState<File | null>(null);
  const { t } = useTranslation(["common", "art"]);
  const ref = React.useRef<HTMLFormElement>(null);
  const fetcher = useFetcher();

  const handleSubmit = () => {
    const formData = new FormData(ref.current!);

    if (img) formData.append("img", img, img.name);
    if (smallImg) formData.append("smallImg", smallImg, smallImg.name);

    fetcher.submit(formData, {
      encType: "multipart/form-data",
      method: "post",
    });
  };

  return (
    <Main halfWidth>
      <Form ref={ref} className="stack md">
        <FormMessage type="info">{t("art:forms.caveats")}</FormMessage>
        <ImageUpload img={img} setImg={setImg} setSmallImg={setSmallImg} />
        <Description />
        <LinkedUsers />
        {data?.art ? <ShowcaseToggle /> : null}
        <div>
          <Button onClick={handleSubmit} disabled={!img && !data?.art}>
            {t("common:actions.save")}
          </Button>
        </div>
      </Form>
    </Main>
  );
}

function ImageUpload({
  img,
  setImg,
  setSmallImg,
}: {
  img: File | null;
  setImg: (file: File | null) => void;
  setSmallImg: (file: File | null) => void;
}) {
  const data = useLoaderData<typeof loader>();
  const { t } = useTranslation(["common"]);

  if (data?.art) {
    return (
      <img
        src={conditionalUserSubmittedImage(previewUrl(data.art.url))}
        alt=""
      />
    );
  }

  return (
    <div>
      <label htmlFor="img-field">{t("common:upload.imageToUpload")}</label>
      <input
        id="img-field"
        className="plain"
        type="file"
        name="img"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={(e) => {
          const uploadedFile = e.target.files?.[0];
          if (!uploadedFile) {
            setImg(null);
            return;
          }

          new Compressor(uploadedFile, {
            success(result) {
              invariant(result instanceof Blob);
              const file = new File([result], uploadedFile.name);

              setImg(file);
            },
            error(err) {
              console.error(err.message);
            },
          });

          new Compressor(uploadedFile, {
            maxWidth: ART.THUMBNAIL_WIDTH,
            success(result) {
              invariant(result instanceof Blob);
              const file = new File([result], uploadedFile.name);

              setSmallImg(file);
            },
            error(err) {
              console.error(err.message);
            },
          });
        }}
      />
      {img && <img src={URL.createObjectURL(img)} alt="" className="mt-4" />}
    </div>
  );
}

function Description() {
  const { t } = useTranslation(["art"]);
  const data = useLoaderData<typeof loader>();
  const [value, setValue] = React.useState(data?.art.description ?? "");

  return (
    <div>
      <Label
        htmlFor="description"
        valueLimits={{ current: value.length, max: ART.DESCRIPTION_MAX_LENGTH }}
      >
        {t("art:forms.description.title")}
      </Label>
      <textarea
        id="description"
        name="description"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={ART.DESCRIPTION_MAX_LENGTH}
      />
    </div>
  );
}

function LinkedUsers() {
  const { t } = useTranslation(["art"]);
  const data = useLoaderData<typeof loader>();
  const [users, setUsers] = React.useState<
    { inputId: string; userId?: number }[]
  >(
    (data?.art.linkedUsers ?? []).length > 0
      ? data!.art.linkedUsers.map((userId) => ({ userId, inputId: nanoid() }))
      : [{ inputId: nanoid() }]
  );

  return (
    <div>
      <label htmlFor="user">{t("art:forms.linkedUsers.title")}</label>
      <input
        type="hidden"
        name="linkedUsers"
        value={JSON.stringify(
          users.filter((u) => u.userId).map((u) => u.userId)
        )}
      />
      {users.map(({ inputId, userId }, i) => {
        return (
          <div key={inputId} className="stack horizontal sm mb-2 items-center">
            <UserCombobox
              inputName="user"
              onChange={(event) => {
                if (!event) return;
                const newUsers = clone(users);
                newUsers[i] = { ...newUsers[i], userId: Number(event.value) };

                setUsers(newUsers);
              }}
              initialUserId={userId}
            />
            {users.length > 1 || users[0].userId ? (
              <Button
                size="tiny"
                variant="minimal-destructive"
                onClick={() => {
                  if (users.length === 1) {
                    setUsers([{ inputId: nanoid() }]);
                  } else {
                    setUsers(users.filter((u) => u.inputId !== inputId));
                  }
                }}
                icon={<CrossIcon />}
              />
            ) : null}
          </div>
        );
      })}
      <Button
        size="tiny"
        onClick={() => setUsers([...users, { inputId: nanoid() }])}
        disabled={users.length >= ART.LINKED_USERS_MAX_LENGTH}
        className="my-3"
      >
        {t("art:forms.linkedUsers.anotherOne")}
      </Button>
      <FormMessage type="info">{t("art:forms.linkedUsers.info")}</FormMessage>
    </div>
  );
}

function ShowcaseToggle() {
  const { t } = useTranslation(["art"]);
  const data = useLoaderData<typeof loader>();
  const isCurrentlyShowcase = Boolean(data?.art.isShowcase);
  const [checked, setChecked] = React.useState(isCurrentlyShowcase);

  return (
    <div>
      <label htmlFor="isShowcase">{t("art:forms.showcase.title")}</label>
      <Toggle
        checked={checked}
        setChecked={setChecked}
        name="isShowcase"
        disabled={isCurrentlyShowcase}
      />
      <FormMessage type="info">{t("art:forms.showcase.info")}</FormMessage>
    </div>
  );
}
