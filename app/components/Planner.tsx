import { Tldraw, type TldrawApp } from "@tldraw/tldraw";
import * as React from "react";
import type { MainWeaponId } from "~/modules/in-game-lists";
import { mainWeaponIds } from "~/modules/in-game-lists";
import { mainWeaponImageUrl } from "~/utils/urls";
import { Button } from "./Button";
import { Image } from "./Image";

const mapUrl = "http://localhost:5800/img/planner-maps/test.png";

export default function Planner() {
  const [app, setApp] = React.useState<TldrawApp | null>(null);

  const handleMount = React.useCallback((app: TldrawApp) => {
    setApp(app);
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

        void app.addMediaFromFiles([file]);
        cb?.();
      });
    },
    [app]
  );

  const handleAddWeapon = React.useCallback(
    (weaponId: MainWeaponId) => {
      handleAddImage(`${mainWeaponImageUrl(weaponId)}.png`, () =>
        app!.selectTool("select")
      );
    },
    [app, handleAddImage]
  );

  const handleAddBackgroundImage = React.useCallback(() => {
    handleAddImage(mapUrl);
  }, [handleAddImage]);

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
