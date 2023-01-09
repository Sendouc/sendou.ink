import type { ActionArgs, LoaderArgs, UploadHandler } from "@remix-run/node";
import {
  redirect,
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  unstable_parseMultipartFormData as parseMultipartFormData,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import * as React from "react";
import { Main } from "~/components/Main";

import Compressor from "compressorjs";
import invariant from "tiny-invariant";
import { Button } from "~/components/Button";
import { useTranslation } from "~/hooks/useTranslation";
import { requireUser } from "~/modules/auth";
import { dateToDatabaseTimestamp } from "~/utils/dates";
import { validate } from "~/utils/remix";
import { teamPage } from "~/utils/urls";
import { addNewImage } from "../queries/addNewImage";
import { countUnvalidatedImg } from "../queries/countUnvalidatedImg.server";
import { s3UploadHandler } from "../s3.server";
import {
  imgTypeToDimensions,
  imgTypeToStyle,
  MAX_UNVALIDATED_IMG_COUNT,
} from "../upload-constants";
import type { ImageUploadType } from "../upload-types";
import { requestToImgType } from "../upload-utils";
import { findByIdentifier } from "~/features/team";
import { isTeamOwner } from "~/features/team";

export const action = async ({ request }: ActionArgs) => {
  const user = await requireUser(request);

  const validatedType = requestToImgType(request);
  validate(validatedType);

  validate(user.team);
  const detailedTeam = findByIdentifier(user.team.customUrl);
  validate(detailedTeam && isTeamOwner({ team: detailedTeam, user }));

  // TODO: graceful error handling when uploading many images
  validate(countUnvalidatedImg(user.id) < MAX_UNVALIDATED_IMG_COUNT);

  const uploadHandler: UploadHandler = composeUploadHandlers(
    s3UploadHandler,
    createMemoryUploadHandler()
  );
  const formData = await parseMultipartFormData(request, uploadHandler);
  const imgSrc = formData.get("img") as string | null;
  invariant(imgSrc);

  const urlParts = imgSrc.split("/");
  const fileName = urlParts[urlParts.length - 1];
  invariant(fileName);

  const shouldAutoValidate = Boolean(user.patronTier);

  addNewImage({
    submitterUserId: user.id,
    teamId: user.team.id,
    type: validatedType,
    url: fileName,
    validatedAt: shouldAutoValidate
      ? dateToDatabaseTimestamp(new Date())
      : null,
  });

  if (shouldAutoValidate) {
    return redirect(teamPage(user.team.customUrl));
  }

  return null;
};

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request);
  const validatedType = requestToImgType(request);

  if (!validatedType || !user.team) {
    throw redirect("/");
  }

  const detailedTeam = findByIdentifier(user.team.customUrl);

  if (!detailedTeam || !isTeamOwner({ team: detailedTeam, user })) {
    throw redirect("/");
  }

  return {
    type: validatedType,
    unvalidatedImages: countUnvalidatedImg(user.id),
  };
};

export default function FileUploadPage() {
  const { t } = useTranslation(["common"]);
  const data = useLoaderData<typeof loader>();
  const [img, setImg] = React.useState<File | null>(null);
  const fetcher = useFetcher();

  const handleSubmit = () => {
    invariant(img);

    const formData = new FormData();
    formData.append("img", img, img.name);

    fetcher.submit(formData, {
      encType: "multipart/form-data",
      method: "post",
    });
  };

  React.useEffect(() => {
    if (fetcher.state === "loading") {
      setImg(null);
    }
  }, [fetcher.state]);

  const { width, height } = imgTypeToDimensions[data.type];

  return (
    <Main className="stack lg">
      <div>
        <div>
          {t("common:upload.title", {
            type: t(`common:upload.type.${data.type}`),
            width,
            height,
          })}
        </div>
        <div className="text-sm text-lighter">
          {t("common:upload.commonExplanation")}{" "}
          {data.unvalidatedImages ? (
            <span>
              {t("common:upload.afterExplanation", {
                count: data.unvalidatedImages,
              })}
            </span>
          ) : null}
        </div>
      </div>
      <div>
        <label htmlFor="img-field">{t("common:upload.imageToUpload")}</label>
        <input
          id="img-field"
          className="plain"
          type="file"
          name="img"
          accept="image/png, image/jpeg, image/webp"
          onChange={(e) => {
            const uploadedFile = e.target.files?.[0];
            if (!uploadedFile) {
              setImg(null);
              return;
            }

            new Compressor(uploadedFile, {
              height,
              width,
              maxHeight: height,
              maxWidth: width,
              // 0.5MB
              convertSize: 500_000,
              resize: "cover",
              success(result) {
                const file = new File([result], `img.webp`, {
                  type: "image/webp",
                });
                setImg(file);
              },
              error(err) {
                console.error(err.message);
              },
            });
          }}
        />
      </div>
      {img ? <PreviewImage img={img} type={data.type} /> : null}
      <Button
        className="self-start"
        disabled={!img || fetcher.state !== "idle"}
        onClick={handleSubmit}
      >
        {t("common:actions.upload")}
      </Button>
    </Main>
  );
}

function PreviewImage({ img, type }: { img: File; type: ImageUploadType }) {
  return (
    <img src={URL.createObjectURL(img)} alt="" style={imgTypeToStyle[type]} />
  );
}
