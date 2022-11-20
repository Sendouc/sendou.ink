import { Tldraw, ColorStyle, type TldrawApp } from "@tldraw/tldraw";
import * as React from "react";
import type { MainWeaponId } from "~/modules/in-game-lists";
import { mainWeaponIds } from "~/modules/in-game-lists";
import { mainWeaponImageUrl } from "~/utils/urls";
import { Button } from "./Button";
import { Image } from "./Image";

const mapUrl = "http://localhost:5800/img/planner-maps/test.png";

export default function Planner() {
  const [_app, setApp] = React.useState<TldrawApp>();
  const app = _app!;

  const handleMount = React.useCallback((app: TldrawApp) => {
    setApp(app);
    app.style({ color: ColorStyle.Red });
  }, []);

  const handleAddImage = React.useCallback(
    (imgUrl: string, cb?: () => void) => {
      if (!app) return;
      void fetch(imgUrl).then(async (response) => {
        const contentType = response.headers.get("content-type");
        const blob = await response.blob();
        // xxx:
        // @ts-expect-error todo: fix this
        const file = new File([blob], "weapon.png", { contentType });

        app
          .addMediaFromFiles([file])
          .then(() => {
            cb?.();
          })
          .catch(console.error);
      });
    },
    [app]
  );

  const handleAddWeapon = React.useCallback(
    (weaponId: MainWeaponId) => {
      handleAddImage(`${mainWeaponImageUrl(weaponId)}.png`, () =>
        app.selectTool("select")
      );
    },
    [app, handleAddImage]
  );

  const handleAddBackgroundImage = React.useCallback(() => {
    app.resetDocument();
    handleAddImage(mapUrl, () => {
      app.selectAll();
      app.toggleLocked();
    });
  }, [app, handleAddImage]);

  return (
    <>
      <div className="plans__top-section">
        <Button onClick={handleAddBackgroundImage}>Add</Button>
      </div>
      <div className="plans__weapons-section">
        {mainWeaponIds.map((weaponId) => {
          return (
            <Button
              key={weaponId}
              variant="minimal"
              onClick={() => handleAddWeapon(weaponId)}
            >
              <Image
                alt=""
                path={mainWeaponImageUrl(weaponId)}
                width={36}
                height={36}
              />
            </Button>
          );
        })}
      </div>
      <Tldraw showMultiplayerMenu={false} onMount={handleMount} />
    </>
  );
}
