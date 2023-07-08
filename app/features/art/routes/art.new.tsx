import type { ActionFunction, LoaderArgs } from "@remix-run/node";
import {
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  unstable_parseMultipartFormData as parseMultipartFormData,
} from "@remix-run/node";
import { Form } from "@remix-run/react";
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
import { validate, type SendouRouteHandle, parseFormData } from "~/utils/remix";
import { ART_PAGE, navIconUrl } from "~/utils/urls";
import { ART } from "../art-constants";
import { newArtSchema } from "../art-schemas.server";
import { addNewArt } from "../queries/addNewArt.server";

export const handle: SendouRouteHandle = {
  breadcrumb: () => ({
    imgPath: navIconUrl("art"),
    href: ART_PAGE,
    type: "IMAGE",
  }),
};

// xxx: edit
export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);

  const uploadHandler = composeUploadHandlers(
    // xxx: remove test
    s3UploadHandler(`test-${nanoid()}-${Date.now()}`),
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

  return null;
};

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request);

  validate(user.isArtist, "No artist role", 401);

  return null;
};

// xxx: image
// xxx: delete image

export default function NewArtPage() {
  const [img, setImg] = React.useState<File | null>(null);
  const [smallImg, setSmallImg] = React.useState<File | null>(null);
  const { t } = useTranslation(["common"]);
  const ref = React.useRef<HTMLFormElement>(null);
  const fetcher = useFetcher();

  // xxx:
  const isValidated = true;
  const isEditing = false;

  const handleSubmit = () => {
    invariant(img && smallImg, "Image is required");
    const formData = new FormData(ref.current!);

    formData.append("img", img, img.name);
    formData.append("smallImg", smallImg, smallImg.name);

    fetcher.submit(formData, {
      encType: "multipart/form-data",
      method: "post",
    });
  };

  return (
    <Main halfWidth>
      <Form ref={ref} className="stack md">
        {isEditing ? (
          <input type="hidden" name="_action" value="EDIT" />
        ) : (
          <input type="hidden" name="_action" value="NEW" />
        )}
        <FormMessage type="info">
          Few things to note: 1) Only upload Splatoon art 2) Only upload art you
          made yourself 3) No NSFW art. There is a validation process before art
          is shown to other users.
        </FormMessage>
        <ImageUpload img={img} setImg={setImg} setSmallImg={setSmallImg} />
        <Description />
        <LinkedUsers />
        {isValidated ? <ShowcaseToggle /> : null}
        <div>
          <Button onClick={handleSubmit} disabled={!img}>
            {t("common:actions.save")}
          </Button>
        </div>
      </Form>
    </Main>
  );
}

// xxx: only show preview when editing
function ImageUpload({
  img,
  setImg,
  setSmallImg,
}: {
  img: File | null;
  setImg: (file: File | null) => void;
  setSmallImg: (file: File | null) => void;
}) {
  const { t } = useTranslation(["common"]);

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
  const [value, setValue] = React.useState("");

  return (
    <div>
      <Label
        htmlFor="description"
        valueLimits={{ current: value.length, max: ART.DESCRIPTION_MAX_LENGTH }}
      >
        Description
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
  const [users, setUsers] = React.useState<
    { inputId: string; userId?: number }[]
  >([{ inputId: nanoid() }]);

  return (
    <div>
      <label htmlFor="user">Linked users</label>
      <input
        type="hidden"
        name="linkedUsers"
        value={JSON.stringify(
          users.filter((u) => u.userId).map((u) => u.userId)
        )}
      />
      {users.map(({ inputId }, i) => {
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
        Another one
      </Button>
      <FormMessage type="info">
        Who is in the art? Linking users allows your art to show up on their
        profile.
      </FormMessage>
    </div>
  );
}

function ShowcaseToggle() {
  const [checked, setChecked] = React.useState(false);

  return (
    <div>
      <label htmlFor="isShowcase">Showcase</label>
      <Toggle checked={checked} setChecked={setChecked} name="isShowcase" />
      <FormMessage type="info">
        Your showcase piece is shown on the common /art page. Only one piece can
        be your showcase at a time.
      </FormMessage>
    </div>
  );
}
